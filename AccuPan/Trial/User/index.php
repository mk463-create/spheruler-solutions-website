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
    if ($_SERVER["REQUEST_METHOD"] == "POST")
    {
     session_unset();
     session_destroy();
     header("Location: https://www.spherulersolutions.com/AccuPan/Trial/");
     exit;
    }
    else
    {
     if (isset($_SESSION['S_username']))
     {
      echo 
      "<input type='file' accept='image/*' id='choose-file' name='choose-file' title='Select image'>
       <img id='Input1_AP' src='Input_AP.jpg' hidden> &nbsp;
       <input type=image id='Input_Logout' src='Logout.png' width='20' height='16'
        onclick='openLogoutForm()' title='Logout'> 
       <div class='forms' id='LogoutForm' >
        <form method='POST' action=";
      echo htmlspecialchars($_SERVER["PHP_SELF"]);
      echo
      "  <input type='hidden' name='form_type' value='Logout_form'>
         Click <input type='submit' name='but_LogoutForm' value='Logout'> to confirm 
        </form>
       </div>";
      $servername = "localhost";
      $username = $_SESSION['S_username'];
      $database = "Spheruler_AccuPan";
      $password = $_SESSION['S_password'];
      // Create connection
      $conn = mysqli_connect($servername, $username, $password, $database);
      // Check connection
      if (!$conn) { die("Connection failed." . mysqli_connect_error()); }
      else 
      {
       $sql_query="SELECT userName FROM Users WHERE assgnUserID='".$username."' AND assgnPwd='".$password."'";
       $result = mysqli_query($conn,$sql_query);
       if (mysqli_num_rows($result)==1)
       {
        $row = mysqli_fetch_assoc($result);
        $Name=$row['userName'];
        echo $Name;
       }
       mysqli_free_result($result);
       mysqli_close($conn);
      }
      echo
      "<canvas id='Output' width='300px' height='150px'> Your browser does not support the HTML5 canvas tag. </canvas>
        <script src='AccuPanTrial.js' defer> </script>
        <script> 
         function openLogoutForm(ev)
         {
          if (document.getElementById('LogoutForm').style.display == 'block') 
          document.getElementById('LogoutForm').style.display = 'none'; 
          else document.getElementById('LogoutForm').style.display = 'block';
         }
        </script>
        <noscript>Sorry, your browser does not support JavaScript!</noscript>
      ";
     }
     else
     {
      header("Location: https://www.spherulersolutions.com/AccuPan/Trial/");
      exit;
     }
    }
   ?>

  </div>
 </body>
</html>