var mongoose=require('mongoose')

//创建user的schema实例
userSchema=new mongoose.Schema(
  {
    name:String,
    password:String,
    email:String,
    avatar:String
  },
  {
    collection:'User'
  }
)

//创建user的model
userModel=mongoose.model('userModel',userSchema)


module.exports=userModel
