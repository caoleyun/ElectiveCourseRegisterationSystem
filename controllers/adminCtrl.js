var formidable = require('formidable');
var path = require("path");
var fs = require("fs");
var url = require("url");
var xlsx = require('node-xlsx');
var Student = require("../models/Student.js");

exports.showAdminDashborad = function(req,res){
	res.render("admin/index",{
		page : "index"
	});
}

exports.showAdminStudent = function(req,res){
	res.render("admin/student",{
		page : "student"
	});
}

// exports.showAdminStudentExport = function(req,res){
// 	res.render("admin/student/export",{
// 		page : "student"
// 	});
// }


exports.showAdminStudentImport = function(req,res){
	res.render("admin/student/import",{
		page : "student"
	});
}


exports.showAdminCourse = function(req,res){
	res.render("admin/course",{
		page : "course"
	});
}

exports.showAdminReport = function(req,res){
	res.render("admin/report",{
		page : "report"
	});
}


//执行表格的上传
exports.doAdminStudentImport = function(req,res){
	var form = new formidable.IncomingForm();
	form.uploadDir = "./uploads";
	form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
    	if(!files.studentexcel.name){
    		res.send("对不起，请上传文件！");
    		return;
    	}

    	//检查拓展名是否正确
    	if(path.extname(files.studentexcel.name) != ".xlsx"){
    		//删除这个不正确的文件
    		fs.unlink("./" + files.studentexcel.path,function(err){
    			if(err){
    				console.log("删除文件错误");
    				return;
    			}
    			res.send("对不起，上传的文件类型不正确，你上传的已经从服务器删除");
    		});
    		return;
    	}

    	// 读取这个Excel表格了，这是一条同步语句，所以没有回调函数
    	//workSheetsFromFile是一个数组
    	var workSheetsFromFile = xlsx.parse("./" + files.studentexcel.path);
    	//检查数组是不是符合规范
    	if(workSheetsFromFile.length != 6){
    		res.send("系统检查到你的Excel表格缺少子表格");
    		return;
    	}
    	//循环检查每个表的表头是否完整
    	for(var i = 0 ; i < 6 ; i++){
    		if(
    			workSheetsFromFile[i].data[0][0] != "学号" ||
    			workSheetsFromFile[i].data[0][1] != "姓名" 
    		){
    			res.send("系统检查到你的Excel表格" + i + "号子表的表头不正确，请保证6个年级的子表的表头都有“学号”、“姓名”");
    			return;
    		}
    	}
    	//至此，我们认为workSheetsFromFile数组是一个合法的数据了！
    	//命令Mongoose将数据存储到数据库中！
    	Student.importStudent(workSheetsFromFile);

    	//输出
    	res.send("上传成功！");
    });
}


//全部学生的数据，被jqGrid限制了API形式。
//并且这个接口是用GET请求发送来的
//如同： student?_search=false&nd=1490872998973&rows=2&page=1&sidx=sid&sord=asc
exports.getAllStudent = function(req,res){

    //拿到参数
	    var rows = url.parse(req.url,true).query.rows;
	    var page = url.parse(req.url,true).query.page;
	    var sidx = url.parse(req.url,true).query.sidx;
	    var sord = url.parse(req.url,true).query.sord;

	    var sordNumber = sord == "asc" ? 1 : -1;

    //分页算法
    Student.count({},function(err,count){

        //总页数
        var total = Math.ceil(count / rows);
        //排序、分页
        //参考了博客：http://blog.csdn.net/zk437092645/article/details/9345885
        var sortobj = {};
        //动态绑定一个键
        sortobj[sidx] = sordNumber;
        //这是一个结合了排序、分页的大检索
        //为什么要暴露records、page、total、rows这些键，都是jqGrid要求的
        //请看     http://blog.mn886.net/jqGrid/ ，  左侧点击新手demo
        //它的API：http://blog.mn886.net/jqGrid/JSONData
        

        Student.find({}).sort(sortobj).skip(rows * (page - 1)).limit( parseInt(rows) ).exec(function(err,results){
            res.json({"records" : count, "page" : page, "total" : total , "rows" : results});
        });

       


    });
}




//修改某个学生
exports.updateStudent = function(req,res){
    //学号
    var sid = parseInt(req.params.sid);
    //得到表单的信息，这部分信息是jQuery通过Ajax发送的
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
        //要更改的键名
        var key = fields.cellname;
        //要更改的键的值
        var value = fields.value;

        //真的更改
        Student.find({"sid" : sid} , function(err,results){
            if(err){
                res.send({"result" : -2});  //-2表示数据库错误
                return;
            }
            if(results.length == 0){
                res.send({"result" : -1});  //-1表示查无此人，无法更改
                return;
            }
            //得到学生
            var thestudent = results[0];
            //改
            thestudent[key] = value;
            //持久化
            thestudent.save(function(err){
                if(err){
                    res.send({"result" : -2});  //-2表示数据库错误
                    return;
                }

                res.send({"result" : 1});   //1表示成功
            });
        });
    });
}
