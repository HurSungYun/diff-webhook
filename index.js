var http    = require('http');
var url     = require('url');

var secret  = 'amazingkey'; // secret key of the webhook
var port    = 8081; // port

const request = require('request');
const gitDiffParser = require('gitdiff-parser');

http.createServer(function(req, res){
    
    console.log("request received");
    res.writeHead(400, {"Content-Type": "application/json"});

    var path = url.parse(req.url).pathname;
    console.log('path', path);

    if(path!='/push' || req.method != 'POST'){
       var data = JSON.stringify({"error": "invalid request"});
       return res.end(data); 
    }

    var jsonString = '';
    req.on('data', function(data){
        jsonString += data;
    });

    req.on('end', function(){
      /*
      var hash = "sha1=" + crypto.createHmac('sha1', secret).update(jsonString).digest('hex');
      if(hash != req.headers['x-hub-signature']){
          console.log('invalid key');
          var data = JSON.stringify({"error": "invalid key", key: hash});
          return res.end(data);
      }
      */

      const inputData = JSON.parse(jsonString);
      const isOpened = inputData.action === "opened";
      const diffURL = inputData.pull_request.diff_url;

      console.log("diffURL", diffURL);

      request(diffURL, function (error, response, body) {
        //callback

        console.log('response.body', response.body);

        const files = gitDiffParser.parse(response.body);

        console.log(files);
        console.log('files[0].hunks', files[0].hunks);
        console.log('files[0].hunks[0].changes', files[0].hunks[0].changes);

        res.writeHead(200, {"Content-Type": "application/json"});
      
        var data = JSON.stringify({"success": true});
  
        return res.end(data);
      });
      
    });

    
}).listen(port);

console.log("Server listening at " + port);