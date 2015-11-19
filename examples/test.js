'use strict';

var dpx = require('../index.js');

dpx('C:/Users/support/Desktop/dpx/001_0010_001.0001.dpx').then(function(instance){

  // read
  
  instance.read('image_element', 'transfer').then(function(res){
    console.log('read', res);
  });
  
  // readMultiple
  
  var arr = [
    { mode: 'image_element', sub: 'transfer' },
    { mode: 'image_element', sub: 'colorimetric' },
    { mode: 'tv_info', sub: 'time_code' }
  ];

  instance.readMultiple(arr).then(function(res){
    console.log('readMultiple', res);
  });
  
  // readAll
  
  instance.readAll().then(function(res){
    console.log('readAll', res);
  });
  
}).catch(function(err){
  console.log(err);
});