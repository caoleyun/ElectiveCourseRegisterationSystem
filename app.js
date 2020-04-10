var express = require("express");
var mongoose = require('mongoose');
var adminCtrl = require("./controllers/adminCtrl.js");
var adminCourseCtrl = require("./controllers/adminCourseCtrl.js");


//创建app
var app = express();
//链接数据库，斜杠后面是数据库的名字
mongoose.connect('mongodb://localhost/ElectiveCourseRegisterationSystem');

//设置模板引擎
app.set("view engine","ejs");

//中间件，路由清单
app.get ("/admin"				,adminCtrl.showAdminDashborad);	//管理员界面 选课状态页面
app.get ("/admin/student"		,adminCtrl.showAdminStudent);	//管理员界面  学生管理页面 
app.get ("/admin/student/import",adminCtrl.showAdminStudentImport);	//管理员界面  学生信息上传页面
app.post("/admin/student/import",adminCtrl.doAdminStudentImport);	//管理员界面   学生信息上传的处理 
app.get ("/student"		        ,adminCtrl.getAllStudent);		//得到所有学生
 app.post  ("/student"		    	,adminCtrl.addStudent);			//增加学生
 app.propfind("/student/:sid"		,adminCtrl.checkStudentExist);	//检查某个学生是否存在
 app.post  ("/student/:sid"			,adminCtrl.updateStudent);		//修改某个学生
 app.get   ("/admin/student/add"		,adminCtrl.showAdminStudentAdd);	//管理员界面
app.delete("/student"		    	,adminCtrl.removeStudent);			//remove学生
app.get   ("/admin/student/download",adminCtrl.downloadStudentXlsx);	//下载学生表格

app.get ("/admin/report"		,adminCtrl.showAdminReport);	//管理员界面      报表页面

app.get ("/admin/course"		,adminCourseCtrl.showAdminCourse);	//管理员界面    课程管理页面
app.get   ("/admin/course/import"	,adminCourseCtrl.showAdminCourseImport);//导入学生（界面）
app.get   ("/admin/course/add"		,adminCourseCtrl.showAdminCourseAdd);	//增加学生 界面
app.post  ("/admin/course/import"	,adminCourseCtrl.doAdminCourseImport);	//增加学生
app.get   ("/course"				,adminCourseCtrl.getAllCourse);			//得到所有学生

//静态资源文件
app.use(express.static("public"));

//设置一个404页面
app.use(function(req,res){
	res.send("你好，你的页面不存在");
});

app.listen(3000);
console.log("程序已经运行在3000端口");