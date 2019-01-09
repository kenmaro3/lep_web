# lep_web

ssh to ec2 instance and then,

```sudo docker pull kenmaro/lep_web:0.1.0```  
```sudo docker container run -itd -p 80:8080 kenmaro/lep_web:0.1.0```   
```sudo docker stop $(sudo docker ps -aq)```  
```sudo docker rm $(sudo docker ps -aq)```  
```sudo docker rmi $(sudo docker images -aq)```  
```sudo docker container commit df3b4cd6c643 kenmaro/lep_web:0.1.2 ```  
``` sudo docker push kenmaro/lep_web:0.1.2 ```  

http://<public DNS of ec2 instance>
