
core = core || {};


core.NODE_PICK_BEHAVIOUR = {
  OLDEST: 0, // not that fun
  NEWEST: 1, // like backtracker
  RANDOM: 2, // like prim
  NEWEST_RANDOM_1_1: 3,
  NEWEST_RANDOM_1_3: 4,
  NEWEST_RANDOM_3_1: 5,
  NEWEST_OLDEST_1_1: 6,
  NEWEST_OLDEST_1_3: 7,
  NEWEST_OLDEST_3_1: 8,
  RANDOM_BEHAVIOUR: 9
};


core.maze = function(seed, size, behaviour = core.NODE_PICK_BEHAVIOUR.RANDOM_BEHAVIOUR) {
  this.seed = seed;
  this.size = size;
  this.behaviour = behaviour;

  this.random_number_generator = new core.random.generators.xorshift(this.seed);
  this.dist_4 = new core.random.distributions.uniform_int(0, 3, this.random_number_generator);
  this.dist_3 = new core.random.distributions.uniform_int(0, 2, this.random_number_generator);
  this.dist_2 = new core.random.distributions.uniform_int(0, 1, this.random_number_generator);

  this.nodes = null;
  this.active_nodes = null;
  this.visited_nodes = null;
};


core.maze.prototype.init = function() {
  this.reset_nodes();
  this.reset_maze();
}


core.maze.prototype.get_node = function(x, y) {
  return this.nodes[y * this.size + x];
};


core.maze.prototype.reset_nodes = function() {
  delete this.nodes;
  this.nodes = new Array(this.size * this.size);

  for (i = 0; i < this.size * this.size; ++i)
    this.nodes[i] = new core.graph_node();

  for (i = 0; i < this.size; ++i) {
    for (j = 0; j < this.size; ++j) {

      if (i == 0)
        this.nodes[j * this.size + i].set_border(core.DIRECTION.LEFT);
      else
        this.nodes[j * this.size + i].neighbors[core.DIRECTION.LEFT] = this.nodes[j * this.size + i - 1]

      if (i == this.size - 1)
        this.nodes[j * this.size + i].set_border(core.DIRECTION.RIGHT);
      else
        this.nodes[j * this.size + i].neighbors[core.DIRECTION.RIGHT] = this.nodes[j * this.size + i + 1]

      if (j == 0)
        this.nodes[j * this.size + i].set_border(core.DIRECTION.UP);
      else
        this.nodes[j * this.size + i].neighbors[core.DIRECTION.UP] = this.nodes[(j - 1) * this.size + i]

      if (j == this.size - 1)
        this.nodes[j * this.size + i].set_border(core.DIRECTION.DOWN);
      else
        this.nodes[j * this.size + i].neighbors[core.DIRECTION.DOWN] = this.nodes[(j + 1) * this.size + i]

    }
  }

};


core.maze.prototype.reset_maze = function() {
  delete this.active_nodes;
  delete this.visited_nodes;
  this.active_nodes = new Array();
  this.visited_nodes = new Array();

  var current_node = this.nodes[0];
  var loop_count = 1;
  do {
    this.visited_nodes.push(current_node);
    current_node.set_visited();
    var directions = current_node.active_directions();
    if (directions.length > 0) {
      var index = this.random_number_generator.rand().mod(directions.length);
      var next_direction = directions[index];
      if (directions.length > 1)
        this.active_nodes.push(current_node);

      var next_node = current_node.neighbors[next_direction];
      next_node.paths[(next_direction + 2) % 4] = core.PATH_TYPE.OPEN;
      current_node.paths[next_direction] = core.PATH_TYPE.OPEN;
      current_node = next_node;
    } else {
      current_node = this.pick_node();
    }
    ++loop_count;
  } while (this.active_nodes.length > 0);
};


core.maze.prototype.pick_oldest = function() {
  return this.active_nodes.shift();
};


core.maze.prototype.pick_newest = function() {
  return this.active_nodes.pop();
};


core.maze.prototype.pick_random = function() {
  var index = this.random_number_generator.rand().mod(this.active_nodes.length);
  var result = this.active_nodes[index];
  this.active_nodes.splice(index, 1);
  return result;
}


core.maze.prototype.pick_node = function() {
  var behaviour = this.behaviour;
  if (undefined === behaviour)
    console.error("core.maze: behaviour is 'undefined'");
  if (core.NODE_PICK_BEHAVIOUR.RANDOM_BEHAVIOUR == behaviour) {
    behaviour = this.random_number_generator.rand().mod(core.NODE_PICK_BEHAVIOUR.RANDOM_BEHAVIOUR);
  }

  switch (behaviour) {
    case core.NODE_PICK_BEHAVIOUR.OLDEST:
      return this.pick_oldest();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST:
      return this.pick_newest();
      break;
    case core.NODE_PICK_BEHAVIOUR.RANDOM:
      return this.pick_random();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_RANDOM_1_1:
      if (0 == this.dist_2.rand())
        return this.pick_newest();
      else
        return this.pick_random();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_RANDOM_1_3:
      if (0 == this.dist_4.rand())
        return this.pick_newest();
      else
        return this.pick_random();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_RANDOM_3_1:
      if (0 == this.dist_4.rand())
        return this.pick_random();
      else
        return this.pick_newest();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_OLDEST_1_1:
      if (0 == this.dist_2.rand())
        return this.pick_newest();
      else
        return this.pick_oldest();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_OLDEST_1_3:
      if (0 == this.dist_4.rand())
        return this.pick_newest();
      else
        return this.pick_oldest();
      break;
    case core.NODE_PICK_BEHAVIOUR.NEWEST_OLDEST_3_1:
      if (0 == this.dist_4.rand())
        return this.pick_oldest();
      else
        return this.pick_newest();
      break;
    default:
      core.console.error("core.maze: unknown node pick behaviour");
  }
}

