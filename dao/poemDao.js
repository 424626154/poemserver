var pool = require('./dao');
var utils = require('../utils/utils'); 
var logger = require('../utils/log4jsutil').logger(__dirname+'/poemDao.js');
const POEM_TABLE = 'poem'; 
const USER_TABLE = 'user';
const COMMENT_TABLE = 'comment';
const LOVE_TABLE = 'love';
const STAR_TABLE = 'star';
const LIMIT_NUM = '100';
module.exports = {
    /*------------作品------------*/
    /**
     * 添加作品
     */
	addPoem:function(userid,title,content,extend,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        var time = utils.getTime();
		var sql = 'INSERT INTO '+POEM_TABLE+' (userid,title,content,extend,time) VALUES (?,?,?,?,?)';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [userid,title,content,extend,time], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    let id = result.insertId;
                    sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ?';
                    sql = 'SELECT poem.*,user.head,user.pseudonym FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    });                                  
                }
            });
        });
	},
    /**
     * 修改作品
     */
    upPoem:function(id,userid,title,content,extend,callback){
        if(extend instanceof Object){
            extend = JSON.stringify(extend);
        }
        var sql = 'UPDATE '+POEM_TABLE+' SET title = ? , content = ? , extend = ? WHERE id = ? AND userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [title,content,extend,id,userid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ?';
                    sql = 'SELECT poem.*,user.head,user.pseudonym FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
                    connection.query(sql, [id], function(err, result) {
                        callback(err, result)
                        connection.release();
                    });                                  
                }
            });
        });
    },
    /**
     * 删除作品
     */
    delPoem:function(id,userid,callback){
        var sql = 'UPDATE '+POEM_TABLE+' SET del = 1 WHERE id = ? AND userid = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 查询最新作品 
     */
	queryNewestPoem(userid,fromid,callback){
		var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id>? AND userid = ? AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT poem.*,user.head,user.pseudonym,poem.time FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
    /**
     * 查询历史作品
     */
	queryHistoryPoem(userid,fromid,callback){
		var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id<? AND userid = ? AND del = 0  ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT poem.*,user.head,user.pseudonym,poem.time FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
		pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
    /*------------作品圈------------*/
    /**
     *查询最新作品圈
     */
	queryNewestAllPoem(fromid,userid,callback){
		var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id>?  AND del = 0  ORDER BY id DESC LIMIT '+LIMIT_NUM;
		sql = 'SELECT poem.id,poem.userid,poem.title,poem.content,poem.extend,poem.lovenum,poem.commentnum,user.head,user.pseudonym,poem.time FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ?'
        sql = 'SELECT tpoem.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tpoem LEFT JOIN ('+sql1+') AS love ON tpoem.id = love.pid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
    /**
     *查询历史作品圈
     */
	queryHistoryAllPoem(fromid,userid,callback){
		var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id < ?  AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        sql = 'SELECT poem.id,poem.userid,poem.title,poem.content,poem.extend,poem.lovenum,poem.commentnum,user.head,user.pseudonym,poem.time FROM ('+sql+') AS poem LEFT JOIN '+USER_TABLE+' ON poem.userid = user.userid';
        var sql1 = 'SELECT * FROM '+LOVE_TABLE+' WHERE userid = ?'
        sql = 'SELECT tpoem.*,IFNULL(love.love,0) as mylove FROM ('+sql+') AS tpoem LEFT JOIN ('+sql1+') AS love ON tpoem.id = love.pid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,userid], function(err, result) {
            	callback(err, result)
                connection.release();
            });
        });
	},
    /**
     * 查询作品基本信息
     */
    queryPoem(pid,callback){
        var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ? AND del = 0 LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, pid, function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     *作品详情
     */
    queryPoemInfo(pid,userid,callback){
        var poem_sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = '+pid+' LIMIT 1';
        var love_commet_sql = 'SELECT * FROM '+LOVE_TABLE+' WHERE pid = '+pid+' AND userid = "'+userid+'" LIMIT 1';
        var star_sql = 'SELECT * FROM '+STAR_TABLE+' WHERE type = 1 AND sid = '+pid+' AND userid = "'+userid+'" LIMIT 1';
        var sql = poem_sql+';'+love_commet_sql+';'+star_sql;
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    var poem = {};
                    if(result[0].length > 0){
                        poem = result[0][0];
                        poem.love = 0;
                        if(result[1].length > 0){
                            poem.love = result[1][0].love;
                        }
                        if(result[2].length > 0){
                            poem.star = result[2][0].star;
                        }
                        // console.log(poem);
                        callback(err, poem)
                        connection.release();
                    }else{
                        callback('作品ID失效', null)
                        connection.release();
                    }
                }
            });
        });
    },
    /**
     * 根据id查询点赞作品
     * return peom{
     *     id,
     *     title,
     *     content,
     *     userid,
     *     loveuser,
     *     lovehead,
     *     loepseudonym,
     *     tiem,
     * }
     */
    queryOpPoem(pid,opuserid,callback){
        pool.getConnection(function(err, connection) {
            connection.beginTransaction(function(err){
                var poem = {};
                var user = {};
                var opuser = {};
                var userid = '';
                var sql0 = 'SELECT * FROM '+POEM_TABLE+' WHERE id = '+pid+' LIMIT 1';
                logger.debug('---sql0---');
                connection.query(sql0, function(err, result) {
                    // logger.debug(sql0);
                    // logger.debug(err);
                    // logger.debug(result);
                    if(err){

                    }else{
                        if(result.length > 0){
                         poem = result[0];
                         userid = poem.userid;
                         logger.debug(userid);
                            logger.debug('---sql1---');
                            var sql1 = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+userid+'" LIMIT 1';
                            connection.query(sql1, function(err, result) {
                                // logger.debug(sql1);
                                // logger.debug(err);
                                // logger.debug(result);
                                if(err){

                                }else{
                                    if(result.length > 0){
                                     user = result[0];
                                     poem.head = user.head;
                                     poem.pseudonym = user.pseudonym;
                                        logger.debug('---sql2---');
                                        var sql2 = 'SELECT * FROM '+USER_TABLE+' WHERE userid = "'+opuserid+'" LIMIT 1';
                                        connection.query(sql2, function(err, result) {
                                            // logger.debug(sql2);
                                            // logger.debug(err);
                                            // logger.debug(result);
                                            if(err){

                                            }else{
                                                if(result.length > 0){
                                                 opuser = result[0];
                                                 poem.opuser = opuser.userid
                                                 poem.ophead = opuser.head;
                                                 poem.oppseudonym = opuser.pseudonym;
                                                }
                                                connection.commit(function(err){
                                                    // logger.debug('---queryOpLovePoem事务完成---');
                                                    // logger.debug(err);
                                                    // logger.debug(poem);
                                                    callback(err,poem);
                                                });
                                                connection.release();
                                            }
                                        });
                                    }
                                }
                            });
                        }
    
                    }
                });
            });
        });

    },
    /*------------评论------------*/
    /**
     * 添加作品评论
     */
    addPoemComment(id,userid,cid,comment,time,callback){
        pool.getConnection(function(err, connection) {
            var comment_data = {
                pid:id,
                userid:userid,
                cid:0,
                cuserid:'',
                comment:comment,
                time:time,
            }
            if(cid > 0 ){//回复评论的评论
                var sql = 'SELECT * FROM '+COMMENT_TABLE+' WHERE id = ?';
                connection.query(sql, [cid], function(err, result) {
                     if(err){
                        callback(err, result)
                        connection.release();
                     }else{
                        if(result.length > 0){
                            var cuserid = result[0].userid;
                            var sql1 = 'INSERT INTO '+COMMENT_TABLE+'(pid,userid,cid,cuserid,comment,time) VALUES(?,?,?,?,?,?)'
                            connection.query(sql1, [id,userid,cid,cuserid,comment,time], function(err, result) {
                                if(err){
                                    callback(err, result);
                                    connection.release();
                                }else{
                                    comment_data.id = result.insertId;
                                    comment_data.cid = cid;
                                    comment_data.cuserid = cuserid;
                                    sql1 = 'SELECT * FROM '+COMMENT_TABLE+' WHERE id = ?';
                                    sql1 = 'SELECT comment.*,user.head,user.pseudonym FROM ('+sql1+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.userid = user.userid';
                                    sql1 = 'SELECT comment.*,user.head AS chead ,user.pseudonym AS cpseudonym FROM ('+sql1+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.cuserid = user.userid';
                                    connection.query(sql1,[comment_data.id],function(err,result){
                                        if(!err&&result.length > 0){
                                            comment_data = result[0];
                                        }
                                        callback(err, comment_data);
                                        connection.release();
                                    })    
                                }
                            });
                        }else{
                            callback(err, result)
                            connection.release();
                        }
                     }   
                });
            }else{
                var sql1 = 'INSERT INTO comment(pid,userid,cid,cuserid,comment,time) VALUES(?,?,?,?,?,?)'
                connection.query(sql1, [id,userid,0,'',comment,time], function(err, result) {
                    if(err){
                        callback(err, result);
                        connection.release();
                    }else{
                        comment_data.id = result.insertId;
                        sql1 = 'SELECT * FROM '+COMMENT_TABLE+' WHERE id = ?';
                        sql1 = 'SELECT comment.*,user.head,user.pseudonym FROM ('+sql1+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.userid = user.userid';
                        connection.query(sql1,[comment_data.id],function(err,result){
                            if(!err&&result.length > 0){
                                comment_data = result[0];
                            }
                            comment_data.chead = '';
                            comment_data.cpseudonym = '';
                            callback(err, comment_data);
                            connection.release();
                        }) 
                    }
                });
            }
        });
    },
    /**
     * 删除评论
     */
    delComment:function(id,userid,callback){
        var sql = 'UPDATE '+COMMENT_TABLE+' SET del = 1 WHERE id = ? AND userid = ?';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 查询最新评论
     */
    queryNewestComment(fromid,pid,callback){
        var sql = 'SELECT * FROM '+COMMENT_TABLE+' WHERE id>?  AND pid = ? AND del = 0  ORDER BY id DESC LIMIT '+LIMIT_NUM;
        var sql = 'SELECT comment.*,user.head,user.pseudonym FROM ('+sql+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.userid = user.userid';
        var sql = 'SELECT comment.*,user.head AS chead ,user.pseudonym AS cpseudonym FROM ('+sql+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.cuserid = user.userid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,pid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    
    /**
     * 查询历史评论
     */
    queryHistoryComment(fromid,pid,callback){
        var sql = 'SELECT * FROM '+COMMENT_TABLE+' WHERE id<?  AND pid = ? AND del = 0 ORDER BY id DESC LIMIT '+LIMIT_NUM;
        var sql = 'SELECT comment.*,user.head,user.pseudonym FROM ('+sql+') AS comment LEFT JOIN '+USER_TABLE+' ON comment.userid = user.userid ORDER BY id DESC';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [fromid,pid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 根据id查询评论人的userid
     */
    queryCommentUserid(id,callback){
        var sql = 'SELECT comment.userid FROM '+COMMENT_TABLE+' WHERE id = ? LIMIT 1';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [id], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /*------------点赞------------*/
    /**
     * 点赞
     */
    lovePoem(pid,userid,love,callback){
        var time = utils.getTime();
        var sql0 = 'INSERT INTO '+LOVE_TABLE+' (pid,userid,love,time) VALUES ('+pid+',"'+userid+'",'+love+','+time+') ON DUPLICATE KEY UPDATE love='+love+',time='+time;
        
        var sql1 = 'SELECT COUNT(*) FROM '+LOVE_TABLE +' WHERE pid = '+pid+' AND love = 1';
        var sql2 = 'UPDATE '+POEM_TABLE+' SET lovenum = ('+sql1+') WHERE id = '+pid; 
        var sql3 = 'SELECT * FROM '+LOVE_TABLE+' WHERE pid = '+pid+' AND userid = "'+userid+'"';
        var sql4 = 'SELECT love.*,user.head,user.pseudonym FROM ('+sql3+') AS love LEFT JOIN '+USER_TABLE+' ON love.userid = user.userid';
        var sql = sql0+';'+sql2+';'+sql4;
        pool.getConnection(function(err, connection) {
            connection.query(sql, function(err, result) {
                if(err){
                    callback(err, result)
                }else{
                    callback(err, result[2][0])
                }
                connection.release();
            });
        });
    },
    /**
     * 添加点赞
     */
    // addLovePoem(id,userid,love,time,callback){
    //     var sql = 'INSERT INTO '+LOVE_TABLE+'(pid,userid,love,time) VALUES (?,?,?,?)';
    //     pool.getConnection(function(err, connection) {
    //         connection.query(sql, [id,userid,love,time], function(err, result) {
    //             callback(err, result)
    //             connection.release();
    //         });
    //     });
    // },
    /**
     * 修改点赞
     */
    // updateLovePoem(id,userid,love,time,callback){
    //     var sql = 'UPDATE '+LOVE_TABLE+' SET love = ?,time = ?  WHERE id = ? AND userid = ?';
    //     pool.getConnection(function(err, connection) {
    //         connection.query(sql, [love,time,id,userid], function(err, result) {
    //             callback(err, result)
    //             connection.release();
    //         });
    //     });
    // },
    /**
     * 查询用户点赞信息
     */
    queryLovePoem(pid,userid,callback){
        var sql = 'SELECT * FROM '+LOVE_TABLE+' WHERE pid = ? AND userid = ? ';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [pid,userid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /**
     * 获取点赞列表
     */
    queryLoves(pid,callback){
        var sql = 'SELECT * FROM '+LOVE_TABLE+' WHERE pid = ? AND love = 1';
        sql = 'SELECT love.*,user.head,user.pseudonym FROM ('+sql+') AS love LEFT JOIN '+USER_TABLE+' ON love.userid = user.userid';
        pool.getConnection(function(err, connection) {
            connection.query(sql, [pid], function(err, result) {
                callback(err, result)
                connection.release();
            });
        });
    },
    /*------------内部数据操作------------*/
    /**
     * 添加点赞数量
     */
    addLoveNum(pid,callback){
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ? AND del = 0'
            connection.query(sql, [pid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    if(result.length > 0){
                        var id = result[0].id;
                        var lovenum = result[0].lovenum + 1;
                        var sql1 = 'UPDATE '+POEM_TABLE+' SET lovenum = ? WHERE id = ?'
                        connection.query(sql1, [lovenum,id], function(err, result) {
                            callback(err, result)
                            connection.release();
                        })
                    }
                }
            });
        });
    },
    /**
     * 取消点赞
     */
    reduceLoveNum(pid,callback){
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ? AND del = 0'
            connection.query(sql, [pid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    if(result.length > 0){
                        var id = result[0].id;
                        if(result[0].lovenum > 0){
                            var lovenum = result[0].lovenum - 1;
                            var sql1 = 'UPDATE '+POEM_TABLE+' SET lovenum = ? WHERE id = ?'
                            connection.query(sql1, [lovenum,id], function(err, result) {
                                callback(err, result)
                                connection.release();
                            })
                        }else{
                            callback(err, result)
                            connection.release();
                        }
                    }else{
                       callback(err, result)
                       connection.release(); 
                    }
                }
            });
        });
    },
    /**
     * 添加评论数量
     */
    addCommentNum(pid,callback){
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ? AND del = 0'
            connection.query(sql, [pid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    if(result.length > 0){
                        var id = result[0].id;
                        var commentnum = result[0].commentnum + 1;
                        var sql1 = 'UPDATE '+POEM_TABLE+' SET commentnum = ? WHERE id = ?'
                        connection.query(sql1, [commentnum,id], function(err, result) {
                            callback(err, result)
                            connection.release();
                        })
                    }
                }
            });
        });
    },
    /**
     * 减少评论数量
     */
    reduceCommentNum(pid,callback){
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT * FROM '+POEM_TABLE+' WHERE id = ? AND del = 0'
            connection.query(sql, [pid], function(err, result) {
                if(err){
                    callback(err, result)
                    connection.release();
                }else{
                    if(result.length > 0){
                        var id = result[0].id;
                        if(result[0].commentnum > 0){
                            var commentnum = result[0].commentnum - 1;
                            var sql1 = 'UPDATE '+POEM_TABLE+' SET commentnum = ? WHERE id = ?'
                            connection.query(sql1, [commentnum,id], function(err, result) {
                                callback(err, result)
                                connection.release();
                            })
                        }else{
                            callback(err, result)
                            connection.release();
                        }
                    }else{
                       callback(err, result)
                       connection.release(); 
                    }
                }
            });
        });
    },
    /**
     * 查询作品点赞数和评论数
     */
    queryLoveComment(pid,callback){
        pool.getConnection(function(err, connection) {
            var sql = 'SELECT id,lovenum,commentnum FROM '+POEM_TABLE+' WHERE id = ? AND del = 0';
            connection.query(sql, [pid], function(err, result) {
                callback(err, result)
                connection.release(); 
            });   
        });
    }
}