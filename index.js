'use strict';

var fs            = require('fs');
var BinaryFile    = require('binary-file');

// Enums 
var ENUM = Object.freeze({
  TRANSFER_TYPES : {
    UNDEFINED        : 0,
    RED              : 1,
    GREEN            : 2,
    BLUE             : 3,
    ALPHA            : 4,
    LUMINANCE        : 6,
    CHROMA           : 7, // Color Difference CbCr
    DEPTH            : 8,
    COMPOSITE        : 9, // Composite Video
    RGB              : 50,
    RGBA             : 51,
    ABGR             : 52,
    BGR              : 53,
    YUV422           : 100, // CbYCrY422
    YUV4224          : 101, // CbYCrYA4224
    YUV444           : 102, // CbYCr444
    YUV4444          : 103, // CbYCrA4444
    USER             : 150
  },
  COLORIMETRIC : {
    USER             : 0,
    PRINT            : 1,
    LINEAR           : 2,
    LOG              : 3,
    UNDEFINED        : 4,
    SMTPE_274M       : 5,
    ITU_R709         : 6, // Rec709
    ITU_R601_625L    : 7,
    ITU_R601_525L    : 8,
    NTSC             : 9,
    PAL              : 10,
    ZDEPTH           : 11, // ZDepth Linear
    DEPTH            : 12 // Depth Homogeneous
  }
});

// Infos
var INFO = Object.freeze({
  file_info     : {
    magic                  : { offset: 0, len: 4},
    offset                 : { offset: 4, type: 'Int32' },
    version                : { offset: 8, len: 8 },
    filesize               : { offset: 16, type: 'Int32' },
    filename               : { offset: 36, len: 100 },
    timestamp              : { offset: 136, len: 24 },
    creator                : { offset: 160, len: 100 },
    project                : { offset: 260, len: 200 },
    copyright              : { offset: 460, len: 200 },
    encrypt_key            : { offset: 660, type: 'Int32' },
    reserved               : { offset: 664, len: 104}
  },
  image_info    : {
    orientation            : { offset : 768, type: 'Int16' },
    number_of_elements     : { offset : 770, type: 'Int16' },
    width                  : { offset : 772, type: 'Int32' },
    height                 : { offset : 776, type: 'Int32' },
    reserved               : { offset : 1356, len: 52 }
  },
  orient_info     : {
    x_offset               : { offset: 1408, type: 'Int32' },
    y_offset               : { offset: 1412, type: 'Int32' },
    x_center               : { offset: 1416, type: 'Float' },
    y_center               : { offset: 1420, type: 'Float' },
    x_size                 : { offset: 1424, type: 'Int32' },
    y_size                 : { offset: 1428, type: 'Int32' },
    source_name            : { offset: 1432, len: 100 },
    source_time            : { offset: 1532, len: 24  },
    input_device           : { offset: 1556, len: 32  },
    input_serial           : { offset: 1588, len: 32  },
    border_x_left          : { offset: 1620, type: 'Int16' },
    border_x_right         : { offset: 1622, type: 'Int16' },
    border_y_left          : { offset: 1624, type: 'Int16' },
    border_y_right         : { offset: 1626, type: 'Int16' },
    aspect_ratio_x         : { offset: 1628, type: 'Int32' },
    aspect_ratio_y         : { offset: 1632, type: 'Int32' },
    reserved               : { offset: 1636, len: 28  }
  },
  film_info       : {
    manufacturer_id        : { offset: 1664, len: 2  },
    film_type              : { offset: 1666, len: 2  },
    perf_offset            : { offset: 1668, len: 2  },
    prefix                 : { offset: 1670, len: 6  },
    count                  : { offset: 1676, len: 4  },
    format                 : { offset: 1680, len: 32 },
    frame_position         : { offset: 1712, type: 'Int32' },
    frame_sequence         : { offset: 1716, type: 'Int32' },
    held_count             : { offset: 1720, type: 'Int32' },
    frame_rate             : { offset: 1724, type: 'Float' },
    shutter_angle          : { offset: 1728, type: 'Float' },
    frame_id               : { offset: 1732, len: 32  },
    slate                  : { offset: 1764, len: 100 },
    reserved               : { offset: 1864, len: 56  }
  },
  tv_info         : {
    time_code              : { offset: 1920, type: 'Int32' },
    user_bits              : { offset: 1924, type: 'Int32' },
    interlace              : { offset: 1928, type: 'Int8' },
    field_number           : { offset: 1929, type: 'Int8' },
    video_signal           : { offset: 1930, type: 'Int8' },
    padding                : { offset: 1931, type: 'Int8' },
    horizontal_sample_rate : { offset: 1932, type: 'Int8' },
    vertical_sample_rate   : { offset: 1936, type: 'Float' },
    frame_rate             : { offset: 1940, type: 'Float' },
    time_offset            : { offset: 1944, type: 'Float' },
    gamma                  : { offset: 1948, type: 'Float' },
    black_level            : { offset: 1952, type: 'Float' },
    black_gain             : { offset: 1956, type: 'Float' },
    break_point            : { offset: 1960, type: 'Float' },
    white_level            : { offset: 1964, type: 'Float' },
    integration_times      : { offset: 1968, type: 'Float' },
    reserved               : { offset: 1972, len: 76 }
  },
  user_info       : {
    id                     : { offset: 2048, len: 32 }
  },
  image_element   : {
    data_sign              : { offset : 780, type: 'Int32' },
    low_data               : { offset : 784, type: 'Int32' },
    low_quantity           : { offset : 788, type: 'Float' },
    high_data              : { offset : 792, type: 'Int32' },
    high_quantity          : { offset : 796, type: 'Float' },
    descriptor             : { offset : 800, type: 'Int8' },
    transfer               : { offset : 801, type: 'Int8' },
    colorimetric           : { offset : 802, type: 'Int8' },
    bit_size               : { offset : 803, type: 'Int8' },
    packing                : { offset : 804, type: 'Int16' },
    encoding               : { offset : 806, type: 'Int16' },
    data_offset            : { offset : 808, type: 'Int32' },
    eol_padding            : { offset : 812, type: 'Int32' },
    eoi_padding            : { offset : 816, type: 'Int32' },
    description            : { offset : 820, len: 32 }
  }
});

/* ----------------------- */

var readTimecode = function(t){
  var res = '';

  for(var i=7; i>=0; i--){
   res += (t >> (i*4)) & 0x0F;
   res += (i%2==0&&i!=0? ':':'');
  }
  return res;
};

var writeTimecode = function(t){
  var clean = t.replace(/:/g, '') 
  clean = clean.split("").reverse().join("");

  var uint = 0;

  for(var i=0; i<=7; i++){
    uint |= parseInt(clean[i]) << 4 * i;
  }
  return uint;
};

var readEnum = function(name, val){
  var curr = ENUM[name];
  for(var key in curr){
    if(curr[key] == val){
      return key;
    }
  }
};

var writeEnum = function(name, val){
  var curr = ENUM[name];
  for(var key in curr){
    if(key == val){
      return curr[key];
    }
  }  
};

/* ----------------------- */

var dpxFile = function(bf){
  
  var binaryFile = bf;
  var defaultParse = true;
  
  /* ----------------------- */
  
  var setDefaultParse = function(val){
    defaultParse = val;
  };
  
  var getInfo = function(mode, sub){
  
    if(!INFO[mode] || !INFO[mode][sub]){
      return false;
    }
    return INFO[mode][sub];
  };
  
  var parse = function(type, sub, val){
    if(!defaultParse)
      return val;
    
    if(sub == 'transfer'){
      val = type=='read'? readEnum('TRANSFER_TYPES', val): writeEnum('TRANSFER_TYPES', val);
    }
    else if(sub == 'colorimetric'){
      val = type=='read'? readEnum('COLORIMETRIC', val): writeEnum('COLORIMETRIC', val);
    }
    else if(sub == 'time_code'){
      val = type=='read'? readTimecode(val): writeTimecode(val);
    }
    return val;
  };
  
  /* ----------------------- */
  /* FUNCTION RETURN */
      
  var read = function(mode, sub){
    var act = getInfo(mode, sub);
    
    return new Promise(function( fullfill, reject ){
      if(!act)
        return reject();

      var mode = (act.type)? 'read'+act.type: 'readString';
      var arg = (act.type)? [act.offset]: [act.len, act.offset];

      binaryFile[mode].apply(binaryFile, arg).then(function(res){
        if(typeof res == 'string')
          res = res.replace(/\u0000/g, '');
        
        res = parse('read', sub, res);
        
        fullfill(res);
      });
    });
  };
 
  var readMultiple = function(arr){
    return new Promise(function( fullfill, reject ){
      
      function* wait(arr){
        for(var i=0; i<arr.length; i++){
          yield i;
        }
      } 
      
      var state = wait(arr);
      var res = {};
      var act;
      
      var f = function(arg){
        
        if(act){
          if(!res[act.mode])
            res[act.mode] = {};
          res[act.mode][act.sub] = arg;
        }
        
        var curr = state.next();
        
        if(curr.done){
          return fullfill(res);
        }
        
        act = arr[curr.value];
        read(act.mode, act.sub).then(f);
      };
      f();
    });   
  };

  var readAll = function(){
    return new Promise(function( fullfill, reject ){

      function* wait(type){
        var key;
        for(key in type? INFO[type]:INFO){
          yield key;
        }
      }  
      
      var mode = wait();
      var res = {}

      var readInfo = function(){
        
        var curr = mode.next();
        if(curr.done){
          return fullfill(res);
        }
        
        res[curr.value] = {};
        
        var it = wait(curr.value);
        var act;
        
        var f = function(arg){
          if(act)
            res[curr.value][act.value] = arg;

          act = it.next();

          if(!act.done)
            read(curr.value, act.value).then(f);
          else
            readInfo();
        };
        f();
      };
      readInfo();
    });
  };
   
  var write = function(mode, sub, v){
    var act = getInfo(mode, sub);
    
    return new Promise(function( fullfill, reject ){
      if(!act)
        return reject();

      var mode = (act.type)? 'write'+act.type: 'writeString';
      var val = parse('write', sub, v);
      val = act.type? parseFloat(val): String(val);
      
      if(!act.type)
        for(var i=0, l=act.len-val.length; i<l; i++) val += '\u0000';
      
      binaryFile[mode](val, act.offset, act.len).then(function(res){
        fullfill(res);
      });
    });
  };
  
  var writeMultiple = function(arr){
    return new Promise(function( fullfill, reject ){
      
      function* wait(arr){
        for(var i=0; i<arr.length; i++)
          yield i;
      } 
      
      var state = wait(arr);
      
      var f = function(){
        
        var curr = state.next();
        
        if(curr.done){
          return fullfill();
        }
        
        var act = arr[curr.value];
        write(act.mode, act.sub, act.val).then(f);
      };
      f();
    });    
  };
    
  var close = function(){
    
    binaryFile.close();
  };
  
  /* ----------------------- */
  
  return {
    read: read,
    write: write,
    writeMultiple: writeMultiple,
    readAll: readAll,
    readMultiple: readMultiple,
    close: close,
    binaryFile: binaryFile,
    setDefaultParse: setDefaultParse
  }
};

/* ----------------------- */

module.exports = function(file){
  return new Promise(function(fullfill, reject){
    
    new BinaryFile(file, 'r+').then(function (instance) {
      var obj = dpxFile(instance);
      
      obj.read('file_info', 'magic').then(function(res){
        if(res.toLowerCase() == 'sdpx')
          fullfill(obj);
        else
          reject('File is not SDPX');
      });
    }).catch(function(err) {
      reject(err);
    }); 
  });
};