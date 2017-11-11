var express=require("express");
var path=require("path");
var session=require("express-session");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var cookieParser=require('cookie-parser');
var flash=require('express-flash');
var app=express();
app.use(session({secret: 'codingdojorocks', cookie: { maxAge: 60000 }}));
app.use(express.static(path.join(__dirname, "./static")));
app.use(bodyParser.urlencoded({extended:true}));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(flash());

mongoose.connect("mongodb://localhost/message_board");
var Schema=mongoose.Schema;

var MessageSchema=new mongoose.Schema({
	name: {type: String, required: [true, "Name is required"], minlength: [4, "Name must be at least 4 characters"]},
	message: {type: String, required: [true, "Message is required"]},
	comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
});
var CommentSchema=new mongoose.Schema({
	name: {type: String, required: [true, "Name is required"], minlength: [4, "Name must be at least 4 characters"]},
	comment: {type: String, required: [true, "Comment is required"]},
	_message: {type: Schema.Types.ObjectId, ref: "Message"}
});

mongoose.model("Message", MessageSchema);
mongoose.model("Comment", CommentSchema);
var Message=mongoose.model("Message");
var Comment=mongoose.model("Comment");

app.get("/", function(req, res){
	Message.find({}).populate("comments").exec(function(err, messages){
		res.render("index", {message: messages});
	});
});

app.post("/messages", function(req, res){
	var message=new Message(req.body);
	message.save(function(err){
		if(err){
			req.flash("message_error", message.errors);
		}
		res.redirect("/");
	});
});

app.post("/messages/:id", function(req, res){
	Message.findOne({_id: req.params.id}, function(err, message){
		if(err){
			res.redirect("/");
		}else{
			var comment=new Comment(req.body);
			comment._post = message._id;
			message.comments.push(comment);
			comment.save(function(err){
				if(err){
					req.flash(req.params.id, comment.errors);
					res.redirect("/");
				}else{
					message.save(function(err){
						res.redirect('/');
					});
				}
			});
		};
	})
});

app.listen(6789, function(){
    console.log("listening on port 6789");
});