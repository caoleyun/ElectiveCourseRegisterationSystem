var express = require("express");
var mongoose = require('mongoose');
var adminCtrl = require("./controllers/adminCtrl.js");


//创建app
var app = express();
//链接数据库，斜杠后面是数据库的名字
mongoose.connect('mongodb://localhost/ElectiveCourseRegisterationSystem');

//设置模板引擎
app.set("view engine","ejs");

//中间件，路由清单
app.get ("/admin"				,adminCtrl.showAdminDashborad);	//管理员界面
app.get ("/admin/student"		,adminCtrl.showAdminStudent);	//管理员界面
app.get ("/admin/student/import",adminCtrl.showAdminStudentImport);	//管理员界面
app.post("/admin/student/import",adminCtrl.doAdminStudentImport);	//管理员界面
app.get ("/admin/course"		,adminCtrl.showAdminCourse);	//管理员界面
app.get ("/admin/report"		,adminCtrl.showAdminReport);	//管理员界面
app.get ("/student"		        ,adminCtrl.getAllStudent);		//得到所有学生
 app.post  ("/student/:sid"			,adminCtrl.updateStudent);		//修改某个学生

//静态资源文件
app.use(express.static("public"));

//设置一个404页面
app.use(function(req,res){
	res.send("你好，你的页面不存在");
});

app.listen(3000);
console.log("程序已经运行在3000端口");