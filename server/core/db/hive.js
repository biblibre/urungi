//var hive = require('node-hive');



exports.testConnection = function(data, setresult) {
console.log('connection to hive at ',data.host,data.database);
/*
theConnection = hive.for({ server:data.host });



theConnection.fetch("SELECT * FROM my_table", function(err, data) {

    console.log('the data',data);

});
*/

    /*
    var assert   = require('assert');
var thrift   = require('thrift');
var transport  = require('thrift/lib/nodejs/lib/thrift/transport');
var ThriftHive = require('../lib/0.7.1-cdh3u2/ThriftHive');
// Client connection
var options = {transport: transport.TBufferedTransport, timeout: 1000};
var connection = thrift.createConnection(data.host, 10000, options);
var client = thrift.createClient(ThriftHive, connection);
// Execute query
client.execute('use default', function(err){
  client.execute('show tables', function(err){
    assert.ifError(err);
    client.fetchAll(function(err, databases){
      if(err){
        console.log(err.message);
      }else{
        console.log(databases);
      }
      connection.end();
    });
  });
});*/
/*
    var hive = require('thrift-hive');
// Client connection
var client = hive.createClient({
  version: '0.7.1-cdh3u2',
  server: data.host,
  port: 10000,
  timeout: 1000
});
// Execute call
    client.execute('use default', function(err){
  client.execute('show tables', function(err){
    assert.ifError(err);
    client.fetchAll(function(err, databases){
      if(err){
        console.log(err.message);
      }else{
        console.log(databases);
      }
      client.end();
    });
  });
});
*/
/*

client.execute('use default', function(err){
  // Query call
  client.query('show tables').on('row', function(database){
    console.log(database);
  }).on('error', function(err){
    console.log(err.message);
    client.end();
  });
  .on('end', function(){
    client.end();
  });
});

  */



var assert     = require('assert');
var thrift     = require('thrift');
var transport  = require('thrift/lib/nodejs/lib/thrift/transport');
var ThriftHive = require('thrift-hive/lib/0.7.1-cdh3u2/ThriftHive');
// Client connection
var options = {transport: transport.TBufferedTransport, timeout: 1000};
var connection = thrift.createConnection('datalake1-m', 10000, options);
var client = thrift.createClient(ThriftHive, connection);
console.log('the client',client);
// Execute query
client.execute('use default', function(err){
     if(err)
        console.log(err.message);
    console.log('uno');
  client.execute('show tables', function(err){
       if(err)
        console.log(err.message);
    assert.ifError(err);
      console.log('dos');
    client.fetchAll(function(err, databases){
      if(err){
        console.log(err.message);
      }else{
          console.log('tres');
        console.log(databases);
      }
      connection.end();
    });
  });
});
}
