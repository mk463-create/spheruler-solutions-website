<!DOCTYPE html>
<?php
 session_start();
?>
<html lang='en'>
 <head>
  <title> Spheruler - AccuPan Demo</title>
  <meta charset='UTF-8'>
  <meta name='description' content='AccuPan: Portal for Customized 
   Development and Testing of JavaScript Plugin for Accurate User Interactive
   Rendering of Scene for 360 Degree Panorama Input Image'>
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
   #choose-file { width: 30%;  overflow: clip;}
  </style>
 </head>
 <body>
  <div>
   <a href='https:\\www.spherulersolutions.com' style='text-decoration:none'> 
   <img src='Logo.png' width='20' height='20'> </a>
   <span class='Text' onclick='aboutAccuPan()'> <h5><u> AccuPan</u></h5>
    <span class='popuptext' id='myPopup'> 
     <b>AccuPan</b> javascript tool gives an intuitive user interactivity in
     viewing of 360-degree panorama content. <br><br>
     Load your favorite (equirectangular) image here to check:<br>
      * Accurate panning of scene with mouse, touch controls <br> 
      * Faithful zooming about the chosen point(s) <br>
      * Right rotation sense at zenith, nadir zones <br>
      * Rebound to unslanted, upright state at view limits<br> <br>
      To custom integrate this renderer in your webpage, <br>
     Contact <b>accupan@spherulersolutions.com</b> today!
    </span>
   </span>

   <?php
    if (array_key_exists('choose-file', $_GET))
    {
     $file_name=$_GET["choose-file"];
     echo "<img id='Input1_AP' src='".$file_name."' hidden>";
    }
    else
    {
     echo
     "<input type='file' accept='image/*' id='choose-file' name='choose-file'>
      <img id='Input1_AP' src='Input_AP.jpg' hidden>";
 
     if ($_SERVER["REQUEST_METHOD"] == "POST")
     {
      $form_type=$_POST['form_type']; 

      if ($form_type=='Reg_form')
      {
       $Name=$_POST["name"]; $Email=$_POST["email"];	
       $Organization=$_POST["organization"];
       if ($Organiztion=='Organization name') $Organization='';
       $Phone=$_POST["phone"];
       if ($Phone=='+91-1234567890') $Phone='';
       $Profession=$_POST["ProfessionSelect"];
       if ($Profession=='Custom') $Profession=$_POST['customInputProf'];
       $SecNext=false;
       $Sectors='';
       if ( (isset($_POST['Checkbox1'])) && ($_POST['Checkbox1'] == 'Enterprise') )
       {
        $Sectors=$Sectors.'Enterprise'; $SecNext=true; 
       }
       if (isset($_POST['Checkbox2']) && $_POST['Checkbox2'] == 'Events')
       {
        if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Events'; $SecNext=true;
       }
       if (isset($_POST['Checkbox3']) && $_POST['Checkbox3'] == 'Real Estate')
       {
        if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Real Estate'; $SecNext=true;
       }
       if (isset($_POST['Checkbox4']) && $_POST['Checkbox4'] == 'Tourism')
       {
         if ($SecNext) $Sectors=$Sectors.', '; 
        $Sectors=$Sectors.'Tourism'; $SecNext=true;
       }
       if (isset($_POST['Checkbox5']) && $_POST['Checkbox5'] == 'Others')
       {
        if (isset($_POST['customInputSect']))
        {
         if ($SecNext) $Sectors=$Sectors.', ';
         $Sectors=$Sectors.$_POST['customInputSect'];
        }
       }
       echo "Form data taken";
     
       if ( strpos($Email,"@") )
       {
        $File=fopen("AccuPan_Registrations.txt","a+");
        if ($File!=false)
        {
         $Data_line=date("d-m-Y h:i:sa")."\t".$Name."\t".$Email."\t".$Organization
          ."\t".$Phone."\t".$Profession."\t".$Sectors."\n";
         fwrite($File,$Data_line);
         fclose($File);
        } 
   
        $servername = "localhost";
        $username = "Karthik";
        $database = "Spheruler_AccuPan";
        $password = "AccuPan2Spheruler";
        $conn = mysqli_connect($servername, $username, $password, $database);
        if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
        else
        {
         echo "Connected";
         $Login_ID=mysqli_real_escape_string($conn,$Email);
         echo $Login_ID;
         $sql_query="SELECT id FROM Users WHERE userID='".$Login_ID."'";
         //$sql_query="SELECT id FROM Users WHERE userID='User1'";
         $result = mysqli_query($conn,$sql_query);
         //echo $result;
         if (mysqli_num_rows($result)==0)
         {
          $sql_query="SELECT id FROM Users";
          $result = mysqli_query($conn,$sql_query);

          $id=mysqli_num_rows($result);
          echo $id;
          if ($id<10)
          {
           $assgnPwd="@UserPwd".$id;
           $assgnUserID="User".$id;
           echo $assgnPwd;
           echo $assgnUserID;
           $id=$id+1;
           $Login_Pwd="AP@".rand(1000,9999);
           $Login_Pwd=mysqli_real_escape_string($conn,$Login_Pwd);
           $Name=mysqli_real_escape_string($conn,$Name);
           $Organization=mysqli_real_escape_string($conn,$Organization);
           $Sectors=mysqli_real_escape_string($conn,$Sectors);
 
           echo $Login_Pwd;
           echo $Sectors;
           $sql_query="INSERT INTO Users (id, userID, userPwd, assgnPwd, assgnUserID, userName, Organization, Profession, Sector)
            VALUES ('".$id."', '".$Login_ID."', '".$Login_Pwd."', '".$assgnPwd."', '".$assgnUserID."', 
             '".$Name."', '".$Organization."', '".$Profession."', '".$Sectors."')";
            //echo $sql_query;
           //$sql_query="INSERT INTO Users (userID, userPwd) VALUES ('User2', 'User2@1234')";
           if (mysqli_query($conn,$sql_query))
           {
            echo "Registration noted.";
            echo "alert('Thanks for registering! Kindly check for email from 'accupan@spherulersolution.com' with login link.')";
            date_default_timezone_set("Asia/Kolkata");
            $Data_line=date("d-m-Y h:i:sa")."\t".$Name."\t".$Email."\t".$Organization
             ."\t".$Phone."\t".$Profession."\t".$Sectors."\n";
            $Subject="AccuPan Registration";
            $MailMessage="Hi ".$Name.",\n\nThanks for your web registration to try 'AccuPan' Software - the best interactive 360 Panorama renderer of the world!.
             Kindly login to the AccuPan Webapp with your registered email address as User ID and the set password: ".$LoginPwd."\n\nWe hope to meet your expectations.
             \nThanks and regards, \nKarthik, Spheruler Solutions (Ph: +91 8144085983)
             \nhttps://www.spherulersolutions.com/AccuPan";
            $Headers = "MIME-Version: 1.0" . "\r\n";
            $Headers .= "Content-type:text/plain;charset=UTF-8" . "\r\n";
            $Headers .= "From: accupan@spherulersolutions.com" . "\r\n";
            $Headers .= "Cc: karthik@spherulersolutions.com" . "\r\n";									   
            mail($Email,$Subject,$MailMessage,$Headers);
           }
           else echo "Registration error!";
          }
          else echo "Registration Limit exceeded!";
         }
         else echo "Email/LoginID already exists!";
        }
       
        mysqli_free_result($result);
        mysqli_close($conn);
       }
      }
  
      if ($form_type=='Login_form')
      {
       $loginStatMsg="";
       $servername = "localhost";
       $username = "Karthik";
       $database = "Spheruler_AccuPan";
       $password = "AccuPan2Spheruler";
       $conn = mysqli_connect($servername, $username, $password, $database);
       if (!$conn) { die("Connection failed: " . mysqli_connect_error()); }
       else
       {
        $Login_ID=mysqli_real_escape_string($conn,$_POST['Login_ID']);
        $Login_Pwd=mysqli_real_escape_string($conn,$_POST['Login_Pwd']);
        {
         //echo "Logged in. ";
         $sql_query="SELECT assgnPwd, assgnUserID FROM Users WHERE userID='".$Login_ID."'
          AND userPwd='".$Login_Pwd."'";
         $result = mysqli_query($conn,$sql_query);
         if (mysqli_num_rows($result)==1)
         {
          $row = mysqli_fetch_assoc($result);
          $username = $row['assgnUserID'];
          $password = $row["assgnPwd"];
          mysqli_free_result($result);
          mysqli_close($conn);
          //echo "Initial connection closed. ";

          $servername = "localhost";
          //$username = $Login_ID;
          $database = "Spheruler_AccuPan";
          //$password = $Login_Pwd;
          // Create connection for actual user and assigned password value
          $conn = mysqli_connect($servername, $username, $password, $database);
          // Check connection
          if (!$conn) { die("Connection failed: " . mysqli_connect_error());
           $loginStatMsg="Invalid Id/Pwd.";}
          else
          {
           echo "User checked in. ";
           $_SESSION['S_username']=$username;
           $_SESSION['S_password']=$password;
           mysqli_close($conn);
           header("Location: https://www.spherulersolutions.com/AccuPan/trialU.php");
           exit;
          }
         }
         else $loginStatMsg="Invalid Id/Pwd.";
        }    
       }
      }
     }
     else
     {
      echo 
      "<input type=image id='Input_Register' src='Register.png' width='20'
        height='20' onclick='openRegForm()'> &nbsp;
       <input type=image id='Input_Login' src='Login.png' width='20'
        height='20' onclick='openLogForm()'>";
	   
      $servername = "localhost";
      $username = "Karthik";
      $database = "Spheruler_AccuPan";
      $password = "AccuPan2Spheruler";
      $conn = mysqli_connect($servername, $username, $password, $database);

      if (!$conn) { die("Server connection failed." . mysqli_connect_error()); }
      else
      {
       mysqli_close($conn);  

       echo
       "<div class='forms' id='RegForm'> 
         <form method='POST' action=";
       echo htmlspecialchars($_SERVER["PHP_SELF"]);
       echo
       " >
          <b>AccuPan User Registration</b><br>
          <input type='hidden' name='form_type' value='Reg_form'>
          <input type='text' name='name' placeholder='Name' maxlength='30' required >
          <span class='error'> * </span><br>
          <input type='text' name='email' placeholder='Email' maxlength='40' required>
          <span class='error'> * </span><br>
          <input type='text' name='organization' placeholder='Organization name' >
          <br>
          <input type='tel' name='phone' pattern='\+[0-9]{1,3}-[0-9]{10}' 
          placeholder='+91-1234567890'> Phone # <br><br>

          <label for='ProfessionSelect'> <b>Profession</b><br> </label>
          <select id='ProfessionSelect' name='ProfessionSelect'
           onchange='CustomOptionProfession()'>
           <option value=''> </option>
           <option value='Interior Designer'> Interior Design </option>
           <option value='Marketing'> Marketing </option>
           <option value='Photographer'> Photographer </option>
           <option value='Web Developer'> Web Developer </option>
           <option value='Custom'> Others </option>
          </select>
          <input type='text' id='customInputProf' name='customInputProf' 
           style='display:none'><br>
           
          <b>Usage sector</b> <br>
          <input type='checkbox' id='Checkbox1' name='Checkbox1' value='Enterprise'>
           <label for='Checkbox1'> Enterprise </label>
          <input type='checkbox' id='Checkbox2' name='Checkbox2' value='Events'>
           <label for='Checkbox2'> Events </label>
          <input type='checkbox' id='Checkbox3' name='Checkbox3' value='Real Estate'>
           <label for='Checkbox3'> Real Estate </label><br>
          <input type='checkbox' id='Checkbox4' name='Checkbox4' value='Tourism'>
           <label for='Checkbox4'> Tourism </label>
          <input type='checkbox' id='Checkbox5' name='Checkbox5' value='Others'
          onchange='CustomOptSect()'>
          <label for='Checkbox5'> Other </label>
          <input type='text' id='customInputSect' name='customInputSect' style='display:none'> <br><br>
        
          <input type='submit' name='but_RegForm' value='Register'>
         </form>
       </div>";
       echo 
       "<div class='forms' id='LoginForm' >
         <form method='POST' action=";
       echo htmlspecialchars($_SERVER["PHP_SELF"]);
       echo
       ">
         <b>Login Form</b><br>
          <input type='hidden' name='form_type' value='Login_form'>
          <input type='text' name='Login_ID' placeholder='User ID (Email)' 
           maxlength='30' required>
          <span class='error'> * </span><br>
          <input type='password' name='Login_Pwd' placeholder='Password' required>
           <span class='error'> * </span><br>
          <input type='submit' name='but_LoginForm' value='Submit'>
         </form>
        </div>";
       echo
       "<script>
         function openRegForm() 
         {
          if (document.getElementById('LoginForm')) 
          document.getElementById('LoginForm').style.display='none';
          if (document.getElementById('RegForm').style.display == 'block') 
          document.getElementById('RegForm').style.display = 'none'; 
          else document.getElementById('RegForm').style.display = 'block';
         }

         function openLogForm() 
         {
          if (document.getElementById('RegForm')) 
           document.getElementById('RegForm').style.display='none';
          if (document.getElementById('LoginForm').style.display == 'block') 
           document.getElementById('LoginForm').style.display = 'none'; 
          else document.getElementById('LoginForm').style.display = 'block';
         }

         function CustomOptionProfession()
         {
          const ProfSel=document.getElementById('ProfessionSelect');
          const cusInp=document.getElementById('customInputProf');
          if (ProfSel.value=='Custom')
          {
           cusInp.style.display='inline';
           cusInp.required=true;
          }
          else 
          {
           cusInp.style.display='none';
           cusInp.required=false;
          }
         }

         function CustomOptSect()
         {
          const cusInp=document.getElementById('customInputSect');
          if (document.getElementById('Checkbox5').checked)
          {
           cusInp.style.display='inline';
           cusInp.required=true;
          }
          else
          {
           cusInp.style.display='none';
           cusInp.required=false;
          }
         }
  
        </script>";
      }
     }
    }
   ?>

   <br><canvas id='Output' width='300px' height='150px'> 
   Your browser does not support the HTML5 canvas tag. </canvas>
  
   <script src='AccuPanTrial.js' defer> </script>
   
   <script> 
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