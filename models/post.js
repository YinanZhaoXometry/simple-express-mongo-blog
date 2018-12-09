var mongoose = require('mongoose')
var marked=require('marked')



postSchema=new mongoose.Schema({
  time:{},
  title:String,
  post:String,
  name:String,
  avatar:String,
  comments:Array,
  tags:Array,
  pv:Number,
})

postSchema.methods.savePost=function(callback){
  var date=new Date()//获取服务器系统时间
  //定义时间对象，供后续使用及扩展
  var time={
    date:date,
    year:date.getFullYear(),
    month:date.getFullYear()+"-"+(date.getMonth()+1),
    day:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+
    (date.getDate()<10?'0'+date.getDate():date.getDate()),
    minute:date.getFullYear()+"-"+(date.getMonth()+1)+"-"+
    (date.getDate()<10?'0'+date.getDate():date.getDate())+
    " "+date.getHours()+":"+
    (date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes())
  }
  //为文章对象增加time属性和对应值
  this.time=time
  //将文章对象储存至数据库
  this.save(null,function(err,docs){
    if(err) callback(err)
    callback(null,docs)
  })
}
//自定义getAllPost方法用于获取10篇文章显示在主页（静态方法）
postSchema.statics.getTenPost=function(name,page,callback){
  var condition={}
  if(name) condition.name=name
  //获取数据库中满足当前查询条件的总记录数total
  var tempModel=this;
  tempModel.countDocuments(condition,function(err,total){
    if(err) callback(err)
    //查询数据库，对查询结果进行分页逻辑配置
    tempModel.find(
      condition,
      null,
      {
        skip:(page-1)*10,
        limit:10,
        sort:{time:-1}
      },
      function(err,docs){
        if(err) callback(err)
        docs.forEach(function(doc){
          doc.post=marked(doc.post)
        })
        callback(null,docs,total)
      }
    )
  })
}

//添加单文章获取方法，用于显示单文章页面（静态方法）
postSchema.statics.getOnePost=function(name,day,title,callback){
  var condition={
    name:name,
    "time.day":day,
    title:title,
  }
  var tempModel=this;
  tempModel.findOne(condition,function(err,doc){
    if(err) return callback(err)
    //每获取一次文章数据，pv值增加1
    tempModel.updateOne(condition,{
      $inc:{pv:1}
    },function(err){
      if(err) return callback(err)
    })
    //将markdown格式的文本解析为HTML
    doc.post=marked(doc.post)
    if(doc.comments){
      doc.comments.forEach(function(comment){
        comment.content=marked(comment.content)
      })
    }
    callback(null,doc)
  })
}

//返回文章原文内容(markdown格式)供用户编辑（静态方法）
postSchema.statics.editPost=function(name,day,title,callback){
  this.findOne({
    name:name,
    "time.day":day,
    title:title
  },function(err,doc){
    if(err) return callback(err)
    callback(null,doc)
  })
}

//为postModel增加更新文章逻辑——update方法(静态方法)
postSchema.statics.updatePost=function(name,day,title,post,callback){
  this.updateOne({
    name:name,
    "time.day":day,
    title:title
  },{
    post:post
  },function(err,result){
    if(err) return callback(err)
    callback(null)
  })
}

//为postModel增加删除文章逻辑（静态方法)
postSchema.statics.deletePost=function(name,day,title,callback){
  console.log(name,day,title,callback)
  this.deleteOne({
    name:name,
    "time.day":day,
    title:title
  },function(err){
    if(err) return callback(err)
    callback(null)
  })
}

//增加保存评论功能
postSchema.statics.saveComment=function(name,day,title,comment,callback){
  // console.log(name,day,title,comment)
  this.findOne({
    name:name,
    "time.day":day,
    title:title
  },function(err,doc){
    console.log(comment.time)
    if(err) return callback(err)
    doc.comments.push(comment)
    doc.save()
    callback(null)
  })
}

//为postModel增加获取存档数据方法
postSchema.statics.getArchive=function(callback){
  this.find({},{
    name:1,
    time:1,
    title:1
  },{
    sort:{time:-1}
  },function(err,docs){
    if(err) callback(err)
    callback(null,docs)
  })
}


//为postModel增加获取标签数据方法
postSchema.statics.getTags=function(callback){
  this.distinct('tags',null,function(err,docs){
    if(err) callback(err)
    callback(null,docs);
  })
}

//为postModel增加按照标签名获取数据的方法
postSchema.statics.getTagPosts=function(tag,callback){
  this.find(
    {tags:tag},
    {post:1,time:1,title:1,name:1},
    {sort:{time:-1}},
    function(err,docs){
      if(err) callback(err)
      callback(null,docs)
    })
}

//为postModel增加搜索关键字查询功能
postSchema.statics.searchKeyword=function(keyword,callback){
  this.find({
    title:keyword
  },{
    name:1,
    time:1,
    title:1
  },{
    sort:{time:-1}
  },function(err,docs){
    if(err) callback(err)
    callback(null,docs)
  })
}

postModel=mongoose.model('Post',postSchema,'Posts')

module.exports=postModel