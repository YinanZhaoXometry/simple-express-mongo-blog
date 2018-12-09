const mongoose=require('mongoose')
var postModel=require('./post')

commentSchema=new mongoose.Schema({
  uname:String
})

commentModel=mongoose.model('Comment',commentSchema)

commentSchema.statics.saveComment=function(name,day,title,comment,callback){
  this.findOne({
    name:name,
    "time.day":day,
    title:title
  },function(err,doc){
    if(err) return callback(err)
    doc.comments.push(comment)
    callback(null)
  })
}




module.exports=commentModel