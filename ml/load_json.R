  require(json)
  
  json.file <- "data/raw/smaple_json.txt"
  json.file <- "data/raw/.txt"
  
  ReadTextStreamFromJsonFile <- function(json.file){
      
      json_data <- fromJSON(paste(readLines(json.file), collapse=""))
      
      uid <- json_data$uniqueId
      
      strokes <-  json_data$strokes
      
      number.of.keys <- length(strokes)
       
      # text.stream <- data.frame(uid       = rep(uid,number.of.keys),
      #                           keystroke = as.character(rep("x",number.of.keys)),
      #                           key_down  = as.character(rep("2015-04-19T01:03:34.211Z",number.of.keys)),
      #                           key_up    = as.character(rep("2015-04-19T01:03:34.211Z",number.of.keys)),
      #                           stringsAsFactors=FALSE)
  
      text.stream <- data.frame(uid		= rep(uid,number.of.keys),
                                interval	= as.numeric(rep(NA,number.of.keys)),
                                pressinterval	= as.numeric(rep(NA,number.of.keys)))
        
      for(k in seq(1:number.of.keys)){
          
          ## key      <- strokes[[k]]$value
          ## key.down <- as.character(strokes[[k]]$time)
          ## key.up   <- as.character(strokes[[k]]$time)
  
          interval <- as.numeric(strokes[[k]]$interval)
          pressinterval <- as.numeric(strokes[[k]]$pressinterval)
          
          # text.stream$keystroke[k] <- key
          # text.stream$key_down[k]  <- key.down
          # text.stream$key_up[k]    <- key.up
      }
      return(text.stream)
  }
  
  
  text.stream <- ReadTextStreamFromJsonFile(json.file)
  
