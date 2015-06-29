
function networkgraphStart() {
  var oReq = new XMLHttpRequest();
  oReq.open("GET", 'edges.0.bin', true);
  oReq.responseType = "arraybuffer";
  oReq.send(null);

  oReq.onload = function (oEvent) {
      var arrayBuffer = new Float32Array(oReq.response);
      // Let's first initialize sigma:
      var s = new sigma(

      {
          renderer: {
              container: document.getElementById('container'),
              type: 'canvas'
      }});

      
      for (var i = 0; i < 144; i++) {
          for (var j = 0; j < 73; j++) {
              s.graph.addNode({
                  id: 'n'+(j*144+i),
                  x: (i+72)%144,
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

          if (counter == 1000){
              counter = 0;
              s.graph.addEdge({
                  size: weight,
                  id: 'e'+i,
                  type: 'curve',
                  source: 'n'+startNode,
                  target: 'n'+endNode});
          }
      }

      // Finally, let's ask our sigma instance to refresh:
      s.refresh();
  }
}
