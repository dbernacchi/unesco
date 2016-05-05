<?php
header("Access-Control-Allow-Origin: *");
?>

<html>
	<head>
		<style>
		    body{font-family: Nunito;
		    font-size: 14px;
		    font-style: normal;
		    font-variant: normal;
		    font-weight: 300;
		    line-height: 39px;
		    color: #B9CBD5;
		    margin: 0;
		    }
		</style>
	</head>
<body>
	
<?php

require './PHPMailer-master/PHPMailerAutoload.php';

$max_filesize = 10485760; //10MB

$target_dir = "/tmp/";
$target_file = $target_dir . basename($_FILES["file"]["name"]);
$file_type = pathinfo($target_file,PATHINFO_EXTENSION);

$filesize = filesize($_FILES["fileToUpload"]["tmp_name"]);

$check = getimagesize($_FILES["fileToUpload"]["tmp_name"]);

$upload_ok = 1;

if($filesize > $max_filesize) {

    echo "Files cannot be larger than 10MB ";
    $upload_ok = 0;
}

if($file_type != "jpg" && $file_type != "png" && $file_type != "jpeg" && $file_type != "gif" && $file_type != "zip" && $file_type != "obj" && $file_type != "mtl" ) {
    echo "Sorry, only JPG, JPEG, PNG, GIF, ZIP, OBJ, and MTL files are allowed. ";
    $upload_ok = 0;
}

if(array_key_exists('email', $_POST) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
	
	$email = $_POST['email'];
	
} else {
	echo "Please provide a valid email address. ";
    $upload_ok = 0;
}

if($upload_ok){
	
	move_uploaded_file($_FILES["file"]["tmp_name"], $target_file);
	
	$mail = new PHPMailer(); // defaults to using php "mail()"
	
	$mail->IsSendmail(); // telling the class to use SendMail transport
	
	//$mail->AddReplyTo("name@yourdomain.com","First Last");
	
	$mail->SetFrom('root@petgtest.com', 'Reclaiming History');
	
	//$mail->AddReplyTo("name@yourdomain.com","First Last");
	
	$address = "todd.lekan@gmail.com";
	
	$mail->AddAddress($address, "");
	
	$mail->AddAddress("info@rekrei.org", "");
	
	$mail->Subject    = "Reclaiming History Submission";
	
	$mail->AltBody    = "Submission from $email"; // optional, comment out and test
	
	$mail->MsgHTML("Submission from $email");
	
	$mail->AddAttachment($target_file);      // attachment
	
	if(!$mail->Send()) {
	  echo "Mailer Error: " . $mail->ErrorInfo;
	} else {
	  echo "Message sent!";
	}

}
?>
</body></html>