# 简单版多人博客系统MongoDB+express

想做一个自己的博客项目，这个项目作为练手，学习学习项目逻辑。该项目是多人博客系统（评论统计出了点问题，找时间改改），欢迎来踩😃:

项目部署地址🚀：http://blog-practice.herokuapp.com/

### 安装
1. 安装依赖:
```
cd <project-name>
  
npm install
```
2. 启动:
```
npm start
```

> 如启动遇到问题可尝试删除 node_modules 文件夹和 package-lock.json 后重复上述步骤。

### 技术栈：
- 服务器、路由：express
- 数据库：MongoDB => Mongoose
- 头像显示：Gravatar
- Markdown格式转换成HTML：marked
- 部署服务器：Heroku


### 功能：
	1）支持阅读、评论计数。
	2）支持用markdown发布文章、评论。
	3）支持文章标记标签。
	4）支持按照标题搜索文章。


### 需优化：
	1）路由代码过于臃肿。
	2）评论计数不对。


**首页：**
![](https://ws1.sinaimg.cn/large/006tNbRwly1fy767slbctj30og0vdn7o.jpg)


**文章页：**
![](https://ws3.sinaimg.cn/large/006tNbRwly1fy767s8bv3j30o90q0n26.jpg)


**用户页：**
![](https://ws1.sinaimg.cn/large/006tNbRwly1fy767s1h8tj30ny0gt0x0.jpg)


**登陆/注册：**
![](https://ws2.sinaimg.cn/large/006tNbRwly1fy767ruuy5j30lw0bmdg8.jpg)

![](https://ws1.sinaimg.cn/large/006tNbRwly1fy767rp83sj30nn0bt0t8.jpg)

---
# practice-express-mongo-blog
My practice of a blog system with express+mongodb

How to use:
1. Install dependencies:
```
cd <project-name>
  
npm install
```
2. Start:
```
npm start
```

If not working properly, try deleting:
package-lock.json file
node_modules folder,
and npm install again.
