
let a = 0

function media(){
    a+=1
function myFunction(x) {
    if (x.matches) { 
        if (a%2==0){
            document.getElementById('con').style.display="none";
        }
        else{
            document.getElementById('con').style.display="block";
        }
    } else { if (a%2==1) a+=1;
        document.getElementById('con').style.display="block";
    }
  }
  
  var x = window.matchMedia("(max-width: 62em)")
  myFunction(x)
  x.addListener(myFunction);
}

