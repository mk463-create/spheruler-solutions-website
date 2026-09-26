<!DOCTYPE html>
<html lang='en'>
 <head>
  <title> Spheruler - AccuPan Demo</title>
  <meta charset='UTF-8'>
  <meta name='description' content='Demonstration of AccuPan JavaScript Program 
   Page, for Accurate Pan Rotation and Interactive Viewing of Scene from any 
   360 Degree Equirectangular Projection Panorama Input Image'>
  <meta name='keyword' content='360 Panorama Viewer, Accurate Panning, 
   Intuitive User Interface, Panorama Viewer, Panorama JavaScript, Intended 
   Movements at Zenith and Nadir, Rigorous Algorithm for Scene Rotation'>
  <meta name='copyright' content='Copyright 2019-2025, Spheruler Solutions
   Private Limited, India'>
  <meta name='author' content='Karthikeyan Thangaraj, Spheruler Solutions'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0,
   user-scalable='no'>
  <style>
   body
   {
    text-align: center; font-family: Arial; font-size: 100%;
    color: black; overflow-y: hidden;
   }
   h5 { line-height:16px; display:inline; color: blue;}
   input { font-size:65%; }
   .msg-form
   {
    background-color: white; display: none; position: fixed;
    color: black; top: 50; opacity: 1.0; right: 15px;
    border: 3px solid #f1f1f1;  z-index: 9;	text-align: left;
   }
   .error {color: #FF0000;}
	.popuptext 
   { 
    position: absolute; visibility: hidden; display: none; text-align: left;
    display: inline-block; width: 90%; left: 2%; top: 12%; font-size: 3.2vw;
    background-color: #FFFFFF; color: #000; border-radius: 12px;
    padding: 8px 8px; border-style: solid; border-color: #000; 
   }
	.show {  visibility: visible; }
  </style>
 </head>
 <body>
  <div>
   <a href='https:\\www.spherulersolutions.com' style='text-decoration:none'> <img src='Logo.png' width='16' height='16'> </a>
   <span class='Text' onclick='aboutAccuPan()'> <h5><u> AccuPan</u></h5>
    <span class='popuptext' id='myPopup'> 
     <b>AccuPan</b> javascript tool gives an intuitive user interactivity in viewing of 360-degree panorama content. <br><br>
     Load your favorite (equirectangular) image here to check:<br>
	 * Accurate panning of scene with mouse, touch controls <br>
	 * Faithful zooming about the chosen point(s) <br>
	 * Right rotation sense at zenith, nadir zones <br>
	 * Rebound to unslanted, upright state at view limits<br> <br>
	 To custom integrate this renderer in your webpage, <br>
	 Contact <b>accupan@spherulersolutions.com</b> now!
	</span>
   </span>
			
   <input type="file" accept="image/*" id="choose-file" name="choose-file" >

   <?php
    $nameErr=$emailErr="";
    if ($_SERVER["REQUEST_METHOD"] == "POST")
    {
     if (empty($_POST["name"])) { $nameErr = "Name is required"; } else { $Name=$_POST["name"]; }
     if (empty($_POST["email"])) { $emailErr = "Email is required"; } else { $Email=$_POST["email"]; }
     if ( (!empty($_POST["name"])) && (!empty($_POST["email"])) && (strlen($Name)<=20) && (strpos($Email,"@")) )											 
     {
      $Phone=$_POST["phone"];
      $Message=$_POST["message"];
      $X=$_POST["X"]; $Y=$_POST["Y"]; $Z=$_POST["Z"];
      $Dev=acos(0.6574*$X-0.7535*$Y)*180/M_PI;
      if ($Dev<3)
      {
       $File=fopen("AccuPan_Messages.txt","a+");
       date_default_timezone_set("Asia/Kolkata");
       if ($File!=false)
       {
        $Data_line=date("d-m-Y h:i:sa")."\t".$Name."\t".$Email."\t".$Phone."\t".$Message."\n";
        fwrite($File,$Data_line);
        fclose($File);
        $Subject="AccuPan Enquiry";
        $MailMessage="Hi ".$Name.",\nRecieved your Enquiry on AccuPan: '".$Message.
         "'\n\nWe value your feedback and will revert back soon.
         \nThanks and regards, \n Karthik, Spheruler Solutions (Ph: +91 8144085983)
         \nhttps://www.spherulersolutions.com/AccuPan";
        $Headers = "MIME-Version: 1.0" . "\r\n";
        $Headers .= "Content-type:text/plain;charset=UTF-8" . "\r\n";
        $Headers .= "From: accupan@spherulersolutions.com" . "\r\n";
        $Headers .= "Cc: karthik@spherulersolutions.com, guru@spherulersolutions.com" . "\r\n";
        mail($Email,$Subject,$MailMessage,$Headers);
       }
       echo "Thank you!";
      }
      else echo "Captcha failed!";
     }
     else echo "Invalid input!";
    }
    else
    {
     echo
     "<input type=image src='Message.png' width='20' height='16' onclick='openForm()'>
      <div class='msg-form' id='MsgForm' >
      <form method='POST' action=";
     echo htmlspecialchars($_SERVER["PHP_SELF"]);
     echo 
     " onsubmit='displayPopup()' >
       Give your feedback below<br>
       <input type='text' name='name' placeholder='Name' maxlength='20'><span class='error'>* <?php echo $nameErr;?></span><br>
       <input type='text' name='email' placeholder='Email'><span class='error'>* <?php echo $emailErr;?></span><br>
       <input type='tel' name='phone' placeholder='Phone'><br>
       <textarea name='message' placeholder='Message' rows='5' cols='30'></textarea> <br>
       <input type='hidden' name='X' id='X' value='0.00'>
       <input type='hidden' name='Y' id='Y' value='0.00'>
       <input type='hidden' name='Z' id='Z' value='0.00'>
       (Captcha: Bring 'Clock' to the view centre)<br>
       <input type='submit' value='Send'>
      </form>
     </div>";
    }
   ?>

   <br>
   <img id='Input1_AP' src='Input_AP.jpg' hidden>
   <canvas id='Output' width='300px' height='150px'> Your browser does not support the HTML5 canvas tag. </canvas>
   <script src='AccuPan.js' defer> </script>
   <script> 
    function openForm() 
    {
     if (document.getElementById('MsgForm').style.display == 'block') 
     document.getElementById('MsgForm').style.display = 'none'; 
     else document.getElementById('MsgForm').style.display = 'block'; 
    }
    function displayPopup()
    {
     document.getElementById('MsgForm').style.display = 'none'; 
     alert("Thanks for your response! We will reply to you soon.");
    }
   </script>
   <noscript>Sorry, your browser does not support JavaScript!</noscript>
  </div>
 </body>
</html>