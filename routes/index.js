var crypto=require('crypto')
const userModel=require('../models/user')
const postModel=require('../models/post')
const commentModel=require('../models/comment')
const multer=require('multer')




module.exports = function(app){
  //用户登陆状态确认函数，如未登录阻止其访问“...”页面
  function checkLogin(req,res,next){
    if(!req.session.user){
      req.flash('error','未登录！')
      res.redirect('/login')
    }
    next();
  }
  
  //用户登陆状态确认函数，如已登录阻止其访问“注册”和“登陆”页面
  function checkNotLogin(req,res,next){
    if(req.session.user){
      req.flash('error','已登录！')
      res.redirect('back')
    }
    next()
  }

  //设置多段文件/表格数据上传中间件
  var storage=multer.diskStorage({
    destination:'./public/images',
    filename:function(req,file,cb){
      cb(null,file.originalname)
    }
  })
  var upload=multer({ storage })


  //网站主页，查询并返回第page页的10篇文章
  app.get('/',function(req,res,next){
    var page=req.query.p ? parseInt(req.query.p) : 1
    postModel.getTenPost(null,page,function(err,posts,total){
      if(err){ posts=[] }
      res.render('index',{
        title:'主页',
        posts:posts,
        page:page,
        isFirstPage:(page-1)===0,
        isLastPage:((page-1)*10+posts.length)==total,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    });
  })

  //如用户已登录则返回上一页
  app.get('/reg',checkNotLogin)
  app.get('/reg',function(req,res){
    res.render('reg',{
      title:'注册',
      user:req.session.user
  })
  })

  app.post('/reg',checkNotLogin)
  //用户点击注册按钮，接收注册信息，执行相关逻辑
  app.post('/reg',function(req,res){
    //声明变量接收信息
    var name=req.body.uname,
        password=req.body.upwd,
        email=req.body.email,
        password_re=req.body['upwd-repeat'];    

    //若两次密码输入不一致，返回提示消息并返回注册页
    if(password!== password_re){
      req.flash('error','两次输入的密码不一致！')
      return res.redirect('/reg');
    }

    //用中间件crypto生成用户密码的MD5哈希值
    var md5=crypto.createHash('md5')
    var password=md5.update(password).digest('hex')

    //使用中间件crypto生成用户邮箱的MD5哈希值
    var emailHash=crypto.createHash('md5')
    var encryptedEmail=emailHash.update(email.toLowerCase()).digest('hex')
    var avatar="https://www.gravatar.com/avatar/"+encryptedEmail+"?=48"

    //检查用户名是否存在
    userModel.findOne({name},function(err,result){
      //如查询执行失败，返回主页并报错
      if(err){
        req.flash('error')
        return res.redirect('/')
      }
      //如用户名存在，返回注册页并报错
      if(result){
        req.flash('error','用户已存在！')
        return res.redirect('/reg')
      }

      //如用户名不存在，保存用户信息
      userDoc=new userModel({
        name,
        password,
        email,
        avatar
      })
      userDoc.save(function(err,userDoc){
        if(err){
          req.flash('error',err)
          return res.redirect('/reg')
        }
        req.session.user=userDoc //将用户信息存入session
        req.flash('success','注册成功！')
        res.redirect('/') //注册成功，返回主页
      })

    })

  })

  app.get('/login',checkNotLogin)
  app.get('/login',function(req,res){
    res.render('login',{
      title:'登陆',
      success:req.flash('success').toString(),
      error:req.flash('error').toString(),
      user:req.session.user
    })
  })

  
  app.post('/login',checkNotLogin)

  //用户点按登陆按钮，接收数据和登陆判断逻辑
  app.post('/login',function(req,res){
    var md5=crypto.createHash('md5')
    var password=md5.update(req.body.password).digest('hex')
    userModel.findOne({name:req.body.name},function(err,result){
      if(!result){
        req.flash('error','用户不存在！');
        return res.redirect('/login');
      }
      if(result.password!==password){
        req.flash('error','密码错误！')
        return res.redirect('/login')
      }
      req.session.user=result
      req.flash('success','登陆成功！')
      res.redirect('/')
    })
  })


  //渲染主页，显示已发表文章
  app.get('/post',checkLogin)
  app.get('/post',function(req,res){
    //调用getPost方法
    
    res.render('post',{
      title:'发表',
      user:req.session.user.name
    })
  })



  //用户点击发表文章按钮，执行相关逻辑
  app.post('/post',checkLogin)
  app.post('/post',function(req,res){
    //从session中获取用户信息
    var currentUser=req.session.user
    var tags=[req.body.tag1, req.body.tag2, req.body.tag3]
    //创建document
    var postDoc=new postModel({
      title:req.body.title,
      post:req.body.post,
      name:currentUser.name,
      avatar:currentUser.avatar,
      tags:tags,
      pv:0,
    })

    //调用savePost方法，传入callback用于逻辑判断
    postDoc.savePost(function(err,result){
      //如保存执行失败，跳转回主页，报告error
      if(err){
        req.flash('error',err)
        return res.redirect('/')
      }
      //如保存成功，提示发表成功！
      req.flash('success','发表成功！')
      res.redirect('/')
    })
  })

  
  app.get('/upload',checkLogin)
  app.get('/upload',function(req,res){
    res.render('upload',{
      title:'文件上传',
      user:req.session.user.name,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  })

  app.post('/upload',checkLogin)
  app.post('/upload',upload.any(),function(req,res){
    req.flash('success','文件上传成功！')
    res.redirect('/upload')
  })


  //用户点击侧边栏ARCHIVE时显示存档页面
  app.get('/archive',function(req,res){
    postModel.getArchive(function(err,posts){
      if(err){
        req.flash('error',err)
        return res.redirect('/')
      }
      console.log('11111',posts)
      res.render('archive',{
        title:'存档',
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })

  //用户点击侧边栏TAGS时显示标签页面
  app.get('/tags',function(req,res){
    postModel.getTags(function(err,tags){
      if(err){
        req.flash('error',err)
        return res.redirect('/')
      }
      res.render('tags',{
        title:'标签',
        tags:tags,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })

  //用户点击不同标签时，展示该标签下的所有文章
  app.get('/tags/:tag',function(req,res){
    var tag=req.params.tag
    postModel.getTagPosts(tag,function(err,posts){
      if(err){
        req.flash('error',err)
        res.redirect('/tags')
      }
      console.log('22222',posts)
      res.render('tag',{
        title:'TAG:'+tag,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })

  //用户点击侧边栏LINKS时，显示友情链接页面
  app.get('/links',function(req,res){
    res.render('links',{
      title:'友情链接',
      user:req.session.user,
      success:req.flash('success').toString(),
      error:req.flash('error').toString()
    })
  })

  //用户点击搜索时，显示serach页面
  app.get('/search',function(req,res){
    postModel.searchKeyword(req.query.keyword,function(err,posts){
      if(err){
        req.flash('error')
        return res.redirect('back')
      }
      res.render('search',{
        title:"SEARCH:"+req.query.keyword,
        posts:posts,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
      })
    })
  })


  //用户点击用户名链接时，显示user页面
  app.get('/u/:name',function(req,res){
    var page=req.query.p?parseInt(req.query.p):1
    //查询用户是否存在
    userModel.findOne({name:req.params.name},function(err,user){
      if(!user){
        req.flash('error','用户不存在！')
        return res.redirect('/') //用户不存在，返回主页
      }
      //用户存在，查询并返回用户第page页的10篇文章
      postModel.getTenPost(
        req.params.name,
        page,
        function(err,posts,total){
          if(err){
            req.flash('error',err)
            return res.redirect('/')
          }
          req.flash('success','查询用户文章成功！')
          res.render('user',{
            title:user.name,
            posts:posts,
            page:page,
            isFirstPage:(page-1)===0,
            isLastPage:((page-1)*10+posts.length)==total,
            user:req.session.user,
            success:req.flash('success').toString(),
            error:req.flash('error').toString()
          })
        }
      )
    })
  })

  //用户点击文章标题链接时，显示article页面
  app.get('/u/:name/:day/:title',function(req,res){
    postModel.getOnePost(
      req.params.name,
      req.params.day,
      req.params.title,
      function(err,post){
        if(err){
          req.flash('error',err)
          return res.redirect('/')
        }
        req.flash('success','获取文章成功！')
        res.render('article',{
          title:req.params.title,
          post:post,
          user:req.session.user,
          success:req.flash('success').toString(),
          error:req.flash('error').toString()
        })
      }
    )
  })

  //留言响应，用户点击发表留言时相关逻辑
  app.post('/u/:name/:day/:title',function(req,res){
    var date=new Date()
    var time=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+
    (date.getDate()<10?('0'+date.getDate()):date.getDate())+' '+
    date.getHours()+':'+
    (date.getMinutes()<10?('0'+date.getMinutes()):date.getMinutes())
    console.log(date,time)
    var md5=crypto.createHash('md5')
    var email_md5=md5.update(req.body.email.toLowerCase()).digest('hex')
    var avatar="https://www.gravatar.com/avatar/"+email_md5+"?s=48"
    var comment={
      name:req.body.name,
      email:req.body.email,
      website:req.body.website,
      content:req.body.content,
      time:time,
      avatar:avatar
    }
    postModel.saveComment(
        req.params.name,
        req.params.day,
        req.params.title,
        comment,
        function(err){
          if(err){
            req.flash('error',err)
            return res.redirect('back')
          }
          req.flash('success','留言成功！')
          res.redirect('back')
        }
      )
  })

  //用户点击编辑文章按钮，显示edti页面
  app.get('/edit/:name/:day/:title',checkLogin)
  app.get('/edit/:name/:day/:title',function(req,res){
    var name=req.params.name
    var day=req.params.day
    var title=req.params.title
    postModel.editPost(name,day,title,function(err,post){
      if(err){
        req.flash('error',err)
        return res.redirect('back')
      }
      req.flash('success','成功获取文章！')
      res.render('edit',{
        title:'编辑',
        post:post,
        user:req.session.user.name,
        success:req.flash('success').toString(),
        errror:req.flash('error').toString()
      })
    })
  })

  //编辑页面，用户点击保存修改按钮，执行postModel更新文章逻辑
  app.post('/edit/:name/:day/:title',checkLogin)
  app.post('/edit/:name/:day/:title',function(req,res){
    var currentUser=req.session.user.name
    var url=encodeURI(`/u/${req.params.name}/${req.params.day}/${req.params.title}`)
    postModel.updatePost(
      currentUser,
      req.params.day,
      req.params.title,
      req.body.post,
      function(err){
        if(err){
          req.flash('error',err)
          return res.redirect(url)//出错，返回文章页
        }
        req.flash('success','文章更新成功！')
        res.redirect(url)
      })
  })

  //用户点击删除文章按钮，执行删除逻辑
  app.get('/remove/:name/:day/:title',function(req,res){
    var currentUser=req.session.user.name
    postModel.deletePost(
        currentUser,
        req.params.day,
        req.params.title,
        function(err){
          if(err){
            req.flash('error',err)
            return res.redirect('/')
          }
          req.flash('success','删除成功！')
          res.redirect('/')
        }
      )
  })


  //用户点击登出按钮，执行相关逻辑
  app.get('/logout',function(req,res){
    req.session.user=null
    req.flash('success','登出成功！')
    res.redirect('/')
  })

  //404页面
  app.use(function(req,res){
    res.render("404")
  })
};
