# * **********************************************************************
#   Programer[s]: Leandro Fernandes
#   Company/Institution: Hackathon (Put our team name here)
#   email: leandroohf@gmail.com
#   Date: April 6, 2015
# * **********************************************************************

  require(rjson)
  require(lubridate)
  
  text.stream	<- BuildFakeTextStream()
  DataCheck() ## Defensive programing
  text.stream	<-  DataMunging(text.stream)
  text.stream	<-  ComputeFeatures(text.stream)
