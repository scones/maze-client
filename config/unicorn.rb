APP_ROOT = File.expand_path(File.dirname(File.dirname(__FILE__)))
if ENV['MY_RUBY_HOME'] && ENV['MY_RUBY_HOME'].include?('rvm')
  begin
    rvm_path = File.dirname(File.dirname(ENV['MY_RUBY_HOME']))
    rvm_lib_path = File.join(rvm_path, 'lib')
    #$LOAD_PATH.unshift rvm_lib_path
    require 'rvm'
    RVM.use_from_path! APP_ROOT
  rescue LoadError
    raise "RVM ruby lib is currently unavailable."
  end
end

ENV['GEM_PATH'] = "/usr/local/rvm/gems/ruby-2.3.1@maze.dev.asm68k.org"
ENV['BUNDLE_GEMFILE'] = File.expand_path('../Gemfile', File.dirname(__FILE__))
require 'bundler/setup'

worker_processes 4
working_directory APP_ROOT

preload_app true

timeout 30

#listen APP_ROOT + "/tmp/sockets/unicorn.sock", :backlog => 64
listen "/run/unicorn.maze.asm68k.org.sock", :backlog => 64

pid "/run/unicorn.maze.asm68k.org.pid"

stderr_path "/var/log/unicorn.maze.asm68k.org.error.log"
stdout_path "/var/log/unicorn.maze.asm68k.org.access.log"

before_fork do |server, worker|
  defined?(ActiveRecord::Base) && ActiveRecord::Base.connection.disconnect!

  old_pid = '/run/unicorn.maze.asm68k.org.pid.oldbin'
  if File.exists?(old_pid) && server.pid != old_pid
    begin
      Process.kill("QUIT", File.read(old_pid).to_i)
    rescue Errno::ENOENT, Errno::ESRCH
      puts "Old master alerady dead"
    end
  end
end

after_fork do |server, worker|
  defined?(ActiveRecord::Base) && ActiveRecord::Base.establish_connection
end


