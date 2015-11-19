# DPX-Header
NodeJs module for dpx header.


```javascript

var dpx = require('dpx-header-editor');

dpx('path/to/my.dpx').then(function(instance){
  
  // execute command (read/write)
  instance.close();
  
}).catch(function(err){

  // catch read error
  console.log(err);
});
```

# Instance method

* read

```javascript

instance.read('file_info', 'creator').then(function(res){

  console.log(res); // 'creator'
});
```

* readMultiple

```javascript

var arr = [
  { mode: 'file_info', sub: 'creator' },
  { mode: 'file_info', sub: 'filesize' },
  { mode: 'tv_info', sub: 'time_code' }
];

instance.readMultiple(arr).then(function(res){

  console.log(res);
  /*
  {
    file_info: {
      creator: 'creator',
      filesize: 1054865 // octet
    },
    tv_info: {
      time_code: '10:15:12:02'
    }
  }
  */
});
```

* readAll

```javascript

instance.readAll().then(function(res){

  console.log(res);
  /*
  {
    file_info: {
      creator: 'creator',
      ...
    },
    tv_info: {
      time_code: '10:15:12:02',
      ...
    },
    ...
  }
  */
});
```

* write

```javascript

instance.write('file_info', 'creator', 'me !').then(function(){

  console.log('end');
});
```

* writeMultiple

```javascript

var arr = [
  { mode: 'file_info', sub: 'creator', val: 'me !' },
  { mode: 'tv_info', sub: 'time_code', val: '10:13:20:12' }
];

instance.readMultiple(arr).then(function(res){

  console.log('end');
});
```

* close

```javascript

instance.close(); // reset buffer and close file
```

# Metadata

* file_info
  - magic                 
  - offset                
  - version               
  - filesize              
  - filename              
  - timestamp             
  - creator               
  - project               
  - copyright             
  - encrypt_key           
  - reserved              


* image_info
  - orientation           
  - number_of_elements    
  - width                 
  - height                
  - reserved              


* orient_info
  - x_offset              
  - y_offset              
  - x_center              
  - y_center              
  - x_size                
  - y_size                
  - source_name           
  - source_time           
  - input_device          
  - input_serial          
  - border_x_left         
  - border_x_right        
  - border_y_left         
  - border_y_right        
  - aspect_ratio_x        
  - aspect_ratio_y        
  - reserved              


* film_info
  - manufacturer_id       
  - film_type             
  - perf_offset           
  - prefix                
  - count                 
  - format                
  - frame_position        
  - frame_sequence        
  - held_count            
  - frame_rate            
  - shutter_angle         
  - frame_id              
  - slate                 
  - reserved              


* tv_info
  - time_code             
  - user_bits             
  - interlace             
  - field_number          
  - video_signal          
  - padding               
  - horizontal_sample_rate
  - vertical_sample_rate  
  - frame_rate            
  - time_offset           
  - gamma                 
  - black_level           
  - black_gain            
  - break_point           
  - white_level           
  - integration_times     
  - reserved              


* user_info
  - id                    


* image_element
  - data_sign             
  - low_data              
  - low_quantity          
  - high_data             
  - high_quantity         
  - descriptor            
  - transfer              
  - colorimetric          
  - bit_size              
  - packing               
  - encoding              
  - data_offset           
  - eol_padding           
  - eoi_padding           
  - description           

# Credits

* [dpx.js](https://github.com/armenfilipetyan/dpx.js) - i used him information
* [timecode](https://github.com/guerilla-di/timecode) - uint to timecode, and reverse (<3) !