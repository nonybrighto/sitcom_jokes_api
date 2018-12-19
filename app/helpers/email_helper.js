class EmailHelper{

    getTransport(){
        return nodemailer.createTransport("SMTP",{
            service: "Gmail",
            auth: {
                user: "******@gmail.com",
                pass: "*****"
            }
        });
    }


    sendMail(mailOptions){
        
        this.getTransport().smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                throw error;
            }else{
                return true;
            }
        });
    }
}