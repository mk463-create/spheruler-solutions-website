<!DOCTYPE html>
<html lang='en'>
 <head>
  <title> Spheruler - AccuPan Demo</title>
  <meta charset='UTF-8'>
  <meta name='description' content='Demonstration of AccuPan JavaScript Program Page, for Accurate Pan Rotation and Interactive Viewing of Scene from any 360 Degree Equirectangular Projection Panorama Input Image'>
  <meta name='keyword' content='360 Panorama Viewer, Accurate Panning, Intuitive User Interface, Panorama Viewer, Panorama JavaScript, Intended Movements at Zenith and Nadir, Rigorous Algorithm for Scene Rotation'>
  <meta name='copyright' content='Copyright 2019-2022, Spheruler Solutions Private Limited, India'>
  <meta name='author' content='Karthikeyan Thangaraj, Spheruler Solutions'>
  <meta name='viewport' content='width=device-width, initial-scale=1.0'>
  <style>
   body { text-align: center; font-family: Arial; font-size: 100%; color: black; overflow-y: hidden;}
   h5 { line-height:16px; display:inline; }
   input { font-size:65%; }
   .msg-form { background-color: white; display: none; position: fixed;	color: black; top: 50; opacity: 1.0; right: 15px; border: 3px solid #f1f1f1;  z-index: 9;	text-align: left; }
   .error {color: #FF0000;}
  </style>
 </head>
 <body>
  <?php
   $nameErr=$emailErr="";
   if ($_SERVER["REQUEST_METHOD"] == "POST")
   {
    if (empty($_POST["name"])) { $nameErr = "Name is required"; } else { $Name=$_POST["name"]; }
    if (empty($_POST["email"])) { $emailErr = "Email is required"; } else { $Email=$_POST["email"]; }
    if ( (!empty($_POST["name"])) && (!empty($_POST["email"])) )
    {
     $Message=$_POST["message"];
     $File=fopen("AccuPan_Messages.txt","a+");
     date_default_timezone_set("Asia/Kolkata");
     if ($File!=false)
     {
      $Data_line=date("d-m-Y h:i:sa")."\t".$Name."\t".$Email."\t".$Message."\n";
      fwrite($File,$Data_line);
      fclose($File);
      $Subject="AccuPan Enquiry";
      $MailMessage="Hi ".$Name.", Thanks for your Enquiry/Feedback on AccuPan. - Spheruler Solutions";
      $Headers = "MIME-Version: 1.0" . "\r\n";
      $Headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
      $Headers .= "From: contact@spherulersolutions.com" . "\r\n";
      $Headers .= "Cc: karthik@spherulersolutions.com" . "\r\n";
      mail($Email,$Subject,$MailMessage,$Headers);
     }
    }
   }
  ?>
		
  <div>
   <h5> <a href='https:\\www.spherulersolutions.com'> <img src='Logo.png' width='16' height='16'> </a> <u>AccuPan</u> </h5>
   <input type="file" accept="image/*" id="choose-file" name="choose-file" >
   <input type=image src='Message.png' width='16' height='16' onclick='openForm()'>
   <div class='msg-form' id='MsgForm' >
    <form method='POST' action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]);?>" onsubmit="displayPopup()" >
     Give your feedback below<br>
     <input type="text" name="name" placeholder="Name"><span class='error'>* <?php echo $nameErr;?></span><br>
     <input type="text" name="email" placeholder="Email"><span class='error'>* <?php echo $emailErr;?></span><br>
     <textarea name="message" placeholder="Message" rows="5" cols="30"></textarea> <br>
     <input type="submit">
    </form>
   </div>
   <img id='Input1_AP' src='Input_AP.jpg' hidden>
   <canvas id='Output' width='300px' height='150px'> Your browser does not support the HTML5 canvas tag. </canvas>
   <script src='AP.js' defer> </script>  
   <script> 
    function openForm() 
    {
     if (document.getElementById('MsgForm').style.display == 'block') document.getElementById('MsgForm').style.display = 'none'; else document.getElementById('MsgForm').style.display = 'block'; 
    }
    function displayPopup()
    {
     alert("Thanks for your message! We will reply to you soon.");
    }
   </script>
   <noscript>Sorry, your browser does not support JavaScript!</noscript>
  </div>
 </body>
</html>