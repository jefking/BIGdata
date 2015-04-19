
  ComputeEucledianDistance <-function(match.features,test.features){
      ## XXX Unit test x1 <- c(0,0), x2 <- c(3,4) => 5.0
      
      d <- sqrt(sum((match.features - test.features)^2))
      
      return(d)
  }
  
