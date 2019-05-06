var fs = require('fs');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", function (req, res) {
    res.redirect('main.html');
});

const nodeMailer = require('nodemailer');

let transporter = nodeMailer.createTransport({
    service:'qq',
    port:465,
    secureConnection:true,
    auth:{
        user:'865285578@qq.com',
        pass:'idqtljnegvgpbdjb',
    }
});

let mailOptions = {
    from:'"李江伟"<865285578@qq.com>',
    to:'865285578@qq.com, 1430959008@qq.com',
    subject:'已收到新的报名信息',
    html:'',
    attachments:[{
        filename:'data.csv',
        path:path.resolve(__dirname,'data.csv'),
    }]
};

app.post('/', function (req, res) {
    fs.exists("data.csv", function (exists) {
        let data = ""; //initialize csv with dom head: \uFEFF
        if (!exists) {
            data += "\uFEFF";
            data += "报读年级,报读年份,报读学期,姓名,性别,证件类型,证件号,生日,报名日期,报名时间,联系人,联系人手机号,现住地址,备注\n";
        }
        data += req.body.grade + ',';
        data += req.body.year + ',';
        data += req.body.season + ',';
        data += req.body.name + ',';
        data += req.body.sex + ',';
        data += req.body.identity + ',';
        data += req.body.id_number + ',';
        data += req.body.birthday + ',';
        data += req.body.sign_in_day + ',';
        data += req.body.time + ',';
        data += req.body.contact +',';
        data += req.body.contact_number + ',';
        data += req.body.address + ',';
        data += req.body.remark + '\n';
        mailOptions.html = '<h1>全部报名信息请在附件中查看</h1>' +
            '<p>以下是新信息摘要：</p>' + data;
        fs.appendFile('data.csv', data, 'utf8', function (error) {
            if (error){
                console.log(error);
            }
            else
                console.log("write successfully");
            res.redirect('info.html');
            transporter.sendMail(mailOptions, (error, info) => {
                if (error){
                    return console.log(error);
                }
                console.log('Message has been sent: %s', info.messageId);
            });
        });
    });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
