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

    isValidEmail(emailAddress){
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(emailAddress).toLowerCase());
    }
}

module.exports = EmailHelper;