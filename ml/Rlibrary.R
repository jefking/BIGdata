  require(rjson)
  require(lubridate)
  
  BuildFakeTextStream <- function(){
  
      text.stream <- data.frame(keystroke=rep("t",8),
                                key_down=rep("2015-04-19T01:03:34.211Z",8),
                                key_up=rep("2015-04-19T01:03:34.210Z",8))
      
      key.down.begin <- as.POSIXct("2015-04-19T01:03:34.213Z",format="%Y-%m-%dT%H:%M:%OSZ")
  
      key.down.intervals <- c(0.000,0.700,1.300,2.400,2.900,3.400,4.000,4.700)
      key.up.intervals   <- key.down.intervals + 0.3
  
      key.down <- key.down.begin + dseconds(key.down.intervals)
      ## print(second(key.down))
  
      key.up <- key.down.begin + dseconds(key.up.intervals)
      ## print(strftime(key.down,format="%Y-%m-%dT%H:%M:%OS3Z"))
      
      text.stream$keystroke <- c("T","h","e"," ","t","e","a","m")
      text.stream$key_down  <- as.character(strftime(key.down,format="%Y-%m-%dT%H:%M:%OS3Z"))
      text.stream$key_up    <- strftime(key.up,format="%Y-%m-%dT%H:%M:%OS3Z")
      
      return(text.stream)
  }
  
  DataMunging <- function(text.stream){
  
      ## Convert to POSIXct in order to use lubridade library
      text.stream$key_down <- as.POSIXct(text.stream$key_down,format="%Y-%m-%dT%H:%M:%OS")
      text.stream$key_up <- as.POSIXct(text.stream$key_up,format="%Y-%m-%dT%H:%M:%OS")
  
      return(text.stream)
  }
  
  DataCheck <- function(){
  
      stopifnot(c("key_down","key_up","keystroke") %in% names(text.stream))
      
  }

  ComputeFeatures <-function(text.stream){
  
      text.stream$dwell  <- GetDwell(text.stream)
      text.stream$speed  <- GetSpeed(text.stream)
      ##text.stream$latency <- GetLatency(text.stream)
      
      return(text.stream)
  }

  
  GetDwell <- function(text.stream){
  
      dwell <- dseconds(interval(start=text.stream$key_down,end = text.stream$key_up))
      return(dwell)
  }
  
  GetSpeed <- function(text.stream){
  
      number.of.keys <- nrow(text.stream)
  
      print(number.of.keys)
      
      first.keystroke.up.time <- text.stream[1,"key_down"]
  
      last.keystroke.up.time  <- text.stream[number.of.keys,"key_up"] 
  
      typing.duration <- dseconds(interval(start= first.keystroke.up.time,
                                           end = last.keystroke.up.time))
  
      
      print(typing.duration)
      speed <- number.of.keys/as.numeric(typing.duration)
      return(speed)
  }
