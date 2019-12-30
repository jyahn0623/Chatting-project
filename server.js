
var app = require("express")();
var server = require("http").createServer(app);
// http -> socket io upgrade!
var io = require("socket.io")(server); 

var db_url = "mongodb+srv://yourid:yourpassword@cluster0-ooan1.mongodb.net/test?retryWrites=true&w=majority";
var mongoose = require("mongoose");
mongoose.connect(db_url, (err)=>{
    if (err){
        console.log(err);
    }
});
// 스키마 설정
var Message = mongoose.model("MSG", { channel : String, name : String, message : String });

// 소켓 정보 
var client_data = {};
var socket = io.on("connection", (socket)=>{
    socket.on("message", (data)=>{
        console.log("client message sent!", data);
        
        client_data[socket.id] = {
            name : data.name
        }
        const msg = new Message(data);
        msg.save((err, doc)=>{
            if (err){
                console.log("when saving data, error occur!");
            }

            Message.find({'channel' : data.channel }, (err, res)=>{
                io.to(data.channel).emit("message", {
                    messages : res,
                })
            });
        })

        io.emit()
    });

    socket.on("getMessage", (data)=>{
        var users, inUser = [];
        try{
            users = io.sockets.adapter.rooms[data.channel].sockets;
            Object.keys(users).map((key)=>{
                try{
                    var name = client_data[key]['name'];
                    inUser.push(name);
                }catch (error){
                    console.log(error);
                }
            });
            
        }catch (error){
            console.log(error);
        }

        socket.join(data.channel);
        Message.find({'channel' : data.channel }, (err, res)=>{
            // of는 네임스페이스 URL을 통한 구분 가능
            // join은 그룹의 개념 leave(), join() 통해 구분 가능.
            io.to(data.channel).emit("init", {
                messages : res,
                users : inUser
            })
        })
    })

    socket.on("bye", (data)=>{
        socket.disconnect();        
    });
});

server.listen(3001, ()=>{
    console.log("Hello, i am a server on jy world!");
})