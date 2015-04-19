  
  require(rjson)
  require(lubridate)
  
  BuildFakeTextStream <- function(){
  
      ## | keystroke | key_down                 | key_up                   |
      ## |-----------+--------------------------+--------------------------|
      ## | T         | 2015-04-19T01:03:34.213Z | 2015-04-19T01:03:34.513Z |
      ## | h         | 2015-04-19T01:03:34.913Z | 2015-04-19T01:03:35.213Z |
      ## | e         | 2015-04-19T01:03:34.812Z | 2015-04-19T01:03:35.113Z |
      ## |           | 2015-04-19T01:03:35.312Z | 2015-04-19T01:03:35.613Z |
      ## | t         | 2015-04-19T01:03:34.713Z | 2015-04-19T01:03:35.013Z |
      ## | e         | 2015-04-19T01:03:34.713Z | 2015-04-19T01:03:35.013Z |
      ## | a         | 2015-04-19T01:03:34.812Z | 2015-04-19T01:03:35.113Z |
      ## | m         | 2015-04-19T01:03:34.913Z | 2015-04-19T01:03:35.213Z |
      ## |-----------+--------------------------+--------------------------|
      
      text.stream <- data.frame(uid=rep(1,8),
                                keystroke=rep("t",8),
                                key_down=rep("2015-04-19T01:03:34.211Z",8),
                                key_up=rep("2015-04-19T01:03:34.210Z",8))
      
      key.down.begin <- as.POSIXct("2015-04-19T01:03:34.213Z",format="%Y-%m-%dT%H:%M:%OSZ")
      
      key.down.intervals <- c(0.000,0.700,1.300,2.400,2.900,3.400,4.000,4.713)
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
  
  PrintFakeTextStream <- function(text.stream){
  
      copy.text.stream          <- text.stream
      copy.text.stream$key_down <- as.character(strftime(key.down,format="%Y-%m-%dT%H:%M:%OS3Z"))
      copy.text.stream$key_up   <- as.character(strftime(key.up,format="%Y-%m-%dT%H:%M:%OS3Z"))
  
      print(copy.text.stream)
      
  }
  
  DataMunging <- function(text.stream){
      
      ## Convert to POSIXct in order to use lubridade library
      text.stream$key_down      <- as.POSIXct(text.stream$key_down,format="%Y-%m-%dT%H:%M:%OS")
      text.stream$key_up        <- as.POSIXct(text.stream$key_up,format="%Y-%m-%dT%H:%M:%OS")
      
      return(text.stream)
  }
  
  DataCheck <- function(){
      
      stopifnot(c("key_down","key_up","keystroke") %in% names(text.stream))
  }
  
  ComputeTextStreamLowLevelIndex <-function(text.stream){
      
      ## hold time
      text.stream$dwell  <-  GetDwell(text.stream)
      text.stream$speed  <-  GetSpeed(text.stream)
      ## time between 2 consecutive key up event
      text.stream$latency <- GetLatency(text.stream)
      text.stream$flight_time <- GetFlightTime(text.stream)
      
      return(text.stream)
  }
  
  ComputeTextSreamFeatures <-function(text.stream){
  
      text.stream.features <- data.frame(uid              = text.stream$uid[1],
                                         MEAN_dwell       = median(text.stream$dwell,na.rm=TRUE),
                                         SD_dwell         = sd(text.stream$dwell,na.rm=TRUE),
                                         speed            = text.stream$speed[1],
                                         MEAN_latency     = median(text.stream$latency,na.rm=TRUE),
                                         SD_latency       = sd(text.stream$latency,na.rm=TRUE ),
                                         MEAN_flight_time = median(text.stream$flight_time,na.rm=TRUE),
                                         SD_flight_time   = sd(text.stream$flight_time,na.rm=TRUE )
                                         )
          
      return(text.stream.features)
  }
  
  BuildDataTarget <-function(text.stream){
      
      return(data.target)
  }
  
  GetDwell <- function(text.stream){
      dwell <- dseconds(interval(start=text.stream$key_down,end = text.stream$key_up))
      return(dwell)
  }
  
  GetSpeed <- function(text.stream){
      
      number.of.keys <- nrow(text.stream)
      
      ## print(number.of.keys)
      
      first.keystroke.up.time <- text.stream[1,"key_down"]    
      last.keystroke.up.time  <- text.stream[number.of.keys,"key_up"] 
      
      typing.duration <- dseconds(interval(start= first.keystroke.up.time,
                                           end = last.keystroke.up.time))
      
      ## print(typing.duration)
      speed <- number.of.keys/as.numeric(typing.duration)
      return(speed)
  }
  
  GetLatency <- function(text.stream){
      ## time between 2 consecutive key up event
      
      number.of.keys <- nrow(text.stream)
      
      start.times <- text.stream$key_up[1:number.of.keys-1]
      end.times   <- text.stream$key_up[2:number.of.keys]
      
      latency <-  dseconds(interval(start= start.times,
                                    end = end.times))
      
      latency <- as.numeric(append(latency,NA))
      return(latency)
  }
  
  GetFlightTime <- function(text.stream){
      ## time between previous keystroke up event and
      ## the next keystroke down event
      
      number.of.keys <- nrow(text.stream)
      
      start.times <- text.stream$key_up[1:number.of.keys-1]
      end.times   <- text.stream$key_down[2:number.of.keys]
      
      flight.time <-  dseconds(interval(start= start.times,
                                        end = end.times))
      
      ## print(as.numeric(flight.time))
      flight.time <- as.numeric(append(flight.time,NA))
      
      return(flight.time)
  }
  
