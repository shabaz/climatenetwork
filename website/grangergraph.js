
function grangergraphStart() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", 'granger.bin', true);
  oReq.responseType = "arraybuffer";
  oReq.send(null);

  oReq.onload = function (oEvent) {
      var arrayBuffer = new Float32Array(oReq.response);
      // Let's first initialize sigma:
      var s = new sigma(

      {
          renderer: {
              container: document.getElementById('granger-container'),
              type: 'canvas'
      }});

      
      for (var i = 0; i < 144; i++) {
          for (var j = 0; j < 73; j++) {
              s.graph.addNode({
                  id: 'n'+(i*73+j),
                  x: (i+0)%144,
                  y: j,
                  size: 0,
                  color: '#000'
              });
          }
      }


      var counter = 0;
      for (var i = 0; i < arrayBuffer.length/3; i++) {
          var startNode = arrayBuffer[i*3];
          var endNode = arrayBuffer[i*3+1];
          var weight = arrayBuffer[i*3+2];
          counter = counter + 1;

          if (counter == 40){
              counter = 0;
              s.graph.addEdge({
                  size: weight,
                  id: 'e'+i,
                  type: 'arrow',
                  source: 'n'+startNode,
                  target: 'n'+endNode});
          }
      }

      // Finally, let's ask our sigma instance to refresh:
      s.refresh();
  }
}
