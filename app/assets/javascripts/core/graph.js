
core = core || {};

core.PATH_TYPE = {
  UNSET: 0,
  OPEN: 1,
  CLOSED: 2
};

core.DIRECTION = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

core.graph_node = function() {
  this.neighbors = new Array(4);
  this.neighbors[0] = undefined;
  this.neighbors[1] = undefined;
  this.neighbors[2] = undefined;
  this.neighbors[3] = undefined;
  this.paths = new Array(4);
  this.paths[0] = core.PATH_TYPE.UNSET;
  this.paths[1] = core.PATH_TYPE.UNSET;
  this.paths[2] = core.PATH_TYPE.UNSET;
  this.paths[3] = core.PATH_TYPE.UNSET;

  this.visited = false;

  core.graph_node.counter = core.graph_node.counter + 1;
  this.id = core.graph_node.counter;
};
core.graph_node.counter = 0;


core.graph_node.prototype.set_neighbor = function(position, node) {
  this.neighbors[position] = node;
}


core.graph_node.prototype.get_neighbor = function(position) {
  return this.neighbors[position];
}


core.graph_node.prototype.is_active = function() {
  for (path in this.paths)
    if (path == core.PATH_TYPE.UNSET)
      return true;
  return false;
}


core.graph_node.prototype.active_directions = function() {
  var result = new Array;
  for (direction = 0; direction < 4; ++direction) {
    if (this.paths[direction] == core.PATH_TYPE.UNSET) {
      if (this.neighbors[direction].was_visited()) {
        this.neighbors[direction].paths[(direction + 2) % 4] = core.PATH_TYPE.CLOSED;
        this.paths[direction] = core.PATH_TYPE.CLOSED;
      } else {
        result.push(direction);
      }
    }
  }
  return result;
}


core.graph_node.prototype.was_visited = function() {
  return this.visited;
}


core.graph_node.prototype.set_visited = function() {
  this.visited = true;
}


core.graph_node.prototype.set_border = function(direction) {
  this.paths[direction] = core.PATH_TYPE.CLOSED;
  this.neighbors[direction] = null;
}

