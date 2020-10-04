const express = require('express'); 
const cors = require('cors');  // Cross Orgin(domain)
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const postRouter = require('./routes/post');
const postsRouter = require('./routes/posts');
const userRouter = require('./routes/user');
const hashtagRouter = require('./routes/hashtag');

const db = require('./models')
const passportConfig = require('./passport');

passportConfig();
dotenv.config();  // Seq의 config.json을 config.js로

const app = express();  // express() = http.server가 됨 -> app
// app.use(미들웨어)

db.sequelize.sync()   // SQL db와 sequelize sync(연결)
   .then(() => {
      console.log('db 연결 성공', Date());
   })
   .catch(console.error);
   // sync할때 테이블을 만드는데 만약 기존 테이블이 있으면 안만듬(create table if not exists)

app.use(morgan('dev'));  // morgan 프론트에서 백엔드로 어떤 요청을 보냈는지를 콘솔에 알려줌
app.use(cors({       // cors모듈 (cross orgin)
   origin: 'http://localhost:3060',
   credentials: true,  
   // cookie도 다른도메인에 전달하려면 넣음(이게 true면 orgin은 *로 불가, 직접 넣어줘야)
   // front에서는 saga index.js에서 withCredentials: true
}));

app.use('/', express.static(path.join(__dirname, 'uploads')));  // image업로드

// front데이터를 req.body에 넣어주는 역할(라우터보다 위에 있어야 함)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// == login session 설정 == 
// back이 front에 email,pw보내줘야하는데 보안취약할수 있으니
// 문자열(=cookie)을 보내고 back은 login-user 정보전체를 session으로 가지고 있음
// session이 전체 user정보 가지고 있으면 메모리부하 -> passport는 session에 id만 가지고 있도록 설정
// 이후에 댓글,포스트등을 쓰면 cookie와 같이 back으로 보내줌 
app.use(cookieParser(process.env.COOKIE_SECRET));   // npm i cookie-parser
app.use(session({
   saveUninitialized: false,
   resave: false,
   secret: process.env.COOKIE_SECRET,  // cookie문자열과 조합으로 데이터 복원가능
   // npm i dotenv 설치, .env에 하드코딩함
   // config.json도 config.js로 바꾸면 .env를 쓸 수 있음
}));     // npm i express-session
app.use(passport.initialize());
app.use(passport.session());


// get,post... 이름은 정하기 나름이지만 일반적으로 이렇게 사용 ->front와 back 개발자가 합의

// app.get -> 가져오다      app.post -> 생성하다(등록)
// app.put -> 전체수정      app.delete -> 제거
// app.patch -> 부분수정    app.options -> 찔러보기(요청할수있어)
// app.head -> 헤더(바디정보)만 가져오기(원래는 헤더/바디 둘다 옴)

// 애매할때는 post를 사용(ex. 게시글 가져오면서(get?), 조회수1올린다(patch?))

// 라우터들  > 길어지니까 분리
app.get('/', (req, res) => {   // '/' main page
   res.send('hello express');  // end가 아니고 exp는 send
});                            

// app.get('/', (req, res) => {  
//    res.send('hello api');
// });

// 브라우저 주소창이 get요청임, post,delete는 axios같은 모듈 이용해 javsscript로 요청함 (postman같은 툴 이용해도됨)

// app.post('/post', (req, res) => {
//       res.json({ id: 1, content: 'hello' });
// });
// app.delete('/post', (req, res) => {
//      res.json({ id: 1 });
// });
// 같은 주소 2개를 routes폴더의 post.js로 가져감
app.use('/post', postRouter); //중복되는 /post를 인자로
app.use('/posts', postsRouter);
app.use('/user', userRouter);
app.use('/hashtag', hashtagRouter);

app.use((err, req, res, next) => {     // error처리 미들웨어
// 기본적으로 들어있지만 에러페이지를 띄우고 싶다거나 하면 별도로 직접 미들웨어 만들 수 있음
});

app.listen(3065, () => console.log('Listening on port 3065 !'));




//<express framework 없이 순수한 node로 실행하는 기본코드>

// const http = require('http');
// // app.js가 실행되는 순간, node runtime이 js코드를 실행해서 node에서 제공하는 http module이 server 역할을 해주는것임. node 자체가 server가 아님

// // 기본원리 Server를 create해서 front-server의 request method와 url에 따라서 response를 해준다 (req 1번에 res 1번, 1:1매치)
// // 만약 response가 없으면 특정시간(약 30초) 후에 브라우저가 자동으로 응답실패로 처리함
// const server = http.createServer((req, res) => {
//    console.log(req.url, req.method);
//    if (req.method === 'GET') {
//       if (req.url === 'api/posts') {

//       }
//    } else if (req.method === 'POST') {
//       if (req.url === '/api/posts') {

//       }
//    } else if (req.method === 'DELETE') {
//       if (req.url === '/api/posts') {

//       }
//    }   // 엄청나게 길어져서 쪼개야 하는데 쉽게하려고 express 프레임워크를 사용함
//    res.write('<h1>Hello node1</h1>');
//    res.write('<h2>Hello node2</h2>');
//    res.end('<h3>Hello node3</h3>');  
//    // write, write ... 마지막은 end
// });

// server.listen(3065, () => console.log('Listening on port 3065'));

