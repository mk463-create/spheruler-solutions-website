<!DOCTYPE html>
<?php
 session_start();
?>
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
   user-scalable=no'>
  <link href='Logo.ico'/>
  <style>
   body
   {
    text-align: center; font-family: Arial; font-size: 100%;
    color: black; overflow-y: hidden;
   }
   h5 { line-height:16px; display:inline; color: blue;}
   input { font-size:65%; }
   .forms
   {
    background-color: white; display: none; position: fixed;
    color: black; top: 50; opacity: 1.0; right: 15px;
    border: 3px solid #f1f1f1;  z-index: 9;	text-align: left;
   }
   .error {color: #FF0000;}
	.popuptext 
   { 
    position: absolute; visibility: hidden; text-align: left;
    display: inline-block; width: 90%; left: 2%; top: 12%; font-size: 3vw;
    background-color: #FFFFFF; color: #000; border-radius: 12px;
    padding: 8px 8px; border-style: solid; border-color: #000; 
   }
	.show {  visibility: visible; }
   #choose-file { width: 150px;  overflow: clip;}
  </style>
 </head>
 <body>
  <div>
   <?php
    $nameErr=$emailErr=$userIDErr=$passwordErr="";
    if ($_SERVER["REQUEST_METHOD"] == "POST")
    {
     $form_type=$_POST['form_type']; 

     if ($form_type=='Msg_form')
     {
      if (empty($_POST["name"])) { $nameErr = "Name is required"; } else { $Name=$_POST["name"]; }
      if (empty($_POST["email"])) { $emailErr = "Email is required"; } else { $Email=$_POST["email"]; }
      if ( (!empty($_POST["name"])) && (!empty($_POST["email"])) && (strlen($Name)<=20) && (strpos($Email,"@")) )
      {
       $Phone=$_POST["phone"];
       $Message=$_POST["message"];
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
        $Headers .= "Cc: karthik@spherulersolutions.com" . "\r\n";
        mail($Email,$Subject,$MailMessage,$Headers);
       }
      }
     }

     if ($form_type=='Login_form')
     {
      $servername = "localhost";
      $username = "Karthik";
      $database = "Spheruler_AccuPan";
      $password = "AccuPan2Spheruler";
      // Create connection
      $conn = mysqli_connect($servername, $username, $password, $database);
      // Check connection
      if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
      else
      {
       if (empty($_POST["Login_ID"])) { $userIDErr = "User ID is required"; } 
        else { $Login_ID=mysqli_real_escape_string($conn,$_POST['Login_ID']); }
       if (empty($_POST["Login_Pwd"])) { $passwordErr = "Password is required"; } 
        else { $Login_Pwd=mysqli_real_escape_string($conn,$_POST['Login_Pwd']); }
       if ( (!empty($_POST["Login_ID"])) && (!empty($_POST["Login_Pwd"])) )
       {
        //$sql_query="SELECT COUNT(*) AS cntUser FROM Users WHERE userID='".$Login_ID."' and userPwd='".$Login_Pwd."'";
        //$result = mysqli_query($conn,$sql_query);
        //$row = mysqli_fetch_array($result);
        //$count = $row['cntUser'];
        $sql_query="SELECT assgnPwd FROM Users WHERE userID='".$Login_ID."' and userPwd='".$Login_Pwd."'";
        $result = mysqli_query($conn,$sql_query);
        //if($count > 0) 
        if (mysqli_num_rows($result)>0)
        {
         $row = mysqli_fetch_assoc($result);
         $password = $row["assgnPwd"];
         echo "Logged in. "; 
         mysqli_close($conn);
         echo "Initial connection closed. ";

         $servername = "localhost";
         $username = $Login_ID;
         $database = "Spheruler_AccuPan";
         //$password = $Login_Pwd;
         // Create connection
         $conn = mysqli_connect($servername, $username, $password, $database);
         // Check connection
         if (!$conn) { die("Connection failed: " . mysqli_connect_error()); echo "Invalid Id/Pwd. ";}
         else
         {
          echo "User reconnected. ";
          $_SESSION['S_username']=$username;
          $_SESSION['S_password']=$password;
          header("Location: https://www.spherulersolutions.com/AccuPan/trialU.php");
          exit;
         }
        }
        else echo "Invalid Id/Pwd. ";
       }   
      }
     }
    }
   ?>

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

   <?php
    if (!array_key_exists('choose-file', $_GET))
    {
     echo 
     "<input type='file' accept='image/*' id='choose-file' name='choose-file'>
      <img id='Input1_AP' src='Input_AP.jpg' hidden>
      &nbsp; <input type=image id='Input_Message' src='Message.png' width='20' height='16' onclick='openMsgForm()'> &nbsp;
      <input type=image id='Input_Login' src='Login.png' width='20' height='16' onclick='openLogForm()'>
     ";
    }
    else
    {
     $file_name=$_GET["choose-file"];
     echo "<img id='Input1_AP' src='".$file_name."' hidden>";
    }
   ?>

   <div class='forms' id='MsgForm' >
    <form method='POST' action='/AccuPan/trial3.php' onsubmit='displayMsgPopup()' >
     Enquiry Form<br>
     <input type='hidden' name='form_type' value='Msg_form'>
     <input type='text' name='name' placeholder='Name' maxlength='20' ><span class='error'>
      * <?php echo $nameErr;?></span><br>
     <input type='text' name='email' placeholder='Email' ><span class='error'>* <?php echo $emailErr;?></span><br>
     <input type='tel' name='phone' placeholder='Phone' ><br>
     <textarea name='message' placeholder='Message' rows='5' cols='30' ></textarea> <br>
     <input type='submit' name='but_MsgForm' value='Send'>
    </form>
   </div>
   <br>

   <?php
    $servername = "localhost";
    $username = "Karthik";
    $database = "Spheruler_AccuPan";
    $password = "AccuPan2Spheruler";

    // Create connection
    $conn = mysqli_connect($servername, $username, $password, $database);

    // Check connection
    if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
    else
    {
     echo 
     "<div class='forms' id='LoginForm' >
      <form method='POST' action='/AccuPan/trial3.php' 'onsubmit='DisplayLoginPopup()' >
       Login Form<br>
       <input type='hidden' name='form_type' value='Login_form'>
       <input type='text' name='Login_ID' placeholder='User ID (Email)' maxlength='30'><span class='error'>
        * <?php echo $userIDErr;?></span><br>
       <input type='password' name='Login_Pwd' placeholder='Password'><span class='error'>
        * <?php echo $passwordErr;?></span><br>
       <input type='submit' name='but_LoginForm' value='Submit'>
      </form>
      </div>
     ";
    }
   ?>
  
   <canvas id='Output' width='300px' height='150px'> Your browser does not support the HTML5 canvas tag. </canvas>
   <script src='AccuPanTrial.js' defer> </script>
   <script> 
    function openMsgForm() 
    {
     if (document.getElementById('LoginForm')) document.getElementById('LoginForm').style.display='none';
     if (document.getElementById('MsgForm').style.display == 'block') 
     document.getElementById('MsgForm').style.display = 'none'; 
     else document.getElementById('MsgForm').style.display = 'block';
    }

    function openLogForm() 
    {
     if (document.getElementById('MsgForm')) document.getElementById('MsgForm').style.display='none';
     if (document.getElementById('LoginForm').style.display == 'block') 
     document.getElementById('LoginForm').style.display = 'none'; 
     else document.getElementById('LoginForm').style.display = 'block';
    }

    function openLogoutForm(ev)
    {
     if (document.getElementById('LogoutForm').style.display == 'block') 
     document.getElementById('LogoutForm').style.display = 'none'; 
     else document.getElementById('LogoutForm').style.display = 'block';
    }

    function displayMsgPopup()
    {
     document.getElementById('MsgForm').style.display = 'none'; 
     alert("Thanks for your message! We will reply to you soon.");
    }

    function displayLoginPopup()
    {
     document.getElementById('LoginForm').style.display = 'none'; 
     alert("Checking the login.");
    }
    
    function aboutAccuPan()
    {
     var AP_popup = document.getElementById('myPopup');
     AP_popup.classList.toggle('show');
    }

    
   </script>
   <noscript>Sorry, your browser does not support JavaScript!</noscript>
  </div>
 </body>
</html>