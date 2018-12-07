/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;



var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  function exists(projName) {
    MongoClient.connect(CONNECTION_STRING, function(err,db) {
      db.collection("issues").findOne({projectTitle: projName}, function(err,result) {
        if (result.result.n > 0) {
          return true;
        }
        return false;
      });
    });
  }

  app.route('/api/issues/:project?')
  
    .get(function (req, res){
      
      let query = req.query;
    if (query.hasOwnProperty("updated_on")) {
         let updatedDate = query.updated_on.split("-");
          query["updated_on"] = new Date(updatedDate[0], updatedDate[1]-1,updatedDate[2]).toDateString()
        }
    if (query.hasOwnProperty("created_on")) {
        let createdDate = query.created_on.split("-");
        query["created_on"] = new Date(createdDate[0], createdDate[1]-1,createdDate[2]).toDateString()
        }
    
   
    console.log(query);
      MongoClient.connect(CONNECTION_STRING, function(err,db) {
          db.collection("issues").find(query).toArray(function(err,result) {
            res.json(result)
          });
         
      });
      
    })
    
    .post(function (req, res){
      console.log('posted')
      let issueTitle = req.body.issue_title;
      let issueText = req.body.issue_text;
      let createdBy = req.body.created_by;
      let assigned = req.body.assigned_to || "N/A";
      let statusText = req.body.status_text || "N/A";
      let createdOn = new Date().toDateString();
      let updatedOn = new Date().toDateString();
      
      MongoClient.connect(CONNECTION_STRING, function(err,db) {
          //db.collection("issues").updateOne({project_title: projectTitle}, {$addToSet: {issues: {issue_title: issueTitle, issue_text: issueText, assigned_to: assigned, created_by: createdBy, created_on: createdOn, updated_on: updatedOn, open: true, status_text: statusText} } });
          db.collection("issues").insertOne({issue_title: issueTitle, issue_text: issueText, assigned_to: assigned, created_by: createdBy, created_on: createdOn, updated_on: updatedOn, open: "true", status_text: statusText});
          res.json({_id: ObjectId(res.insertedId), issue_title: issueTitle, issue_text: issueText, assigned_to: assigned, created_by: createdBy, created_on: createdOn, updated_on: updatedOn, open: "true", status_text: statusText});
      });
    })
    
    .put(function (req, res){

      let id = req.body.issue_id;
      let issueTitle = req.body.new_issue_title;
      let issueText = req.body.issue_text;
      let createdBy = req.body.created_by;
      let updatedOn = new Date().toDateString();
      let status = req.body.open;
      let assigned = req.body.assigned_to || "N/A";
      let statusText = req.body.status_text || "N/A";
      let query = {};
      if (issueTitle.length > 0) {
        query.issue_title = issueTitle
      }
    if (issueText.length > 0) {
        query.issue_text = issueText
      }
    if (createdBy.length > 0) {
        query.created_by = createdBy
      }
    if (assigned.length > 0) {
        query.assigned_to = assigned
      }
    if (statusText.length > 0) {
        query.status_text = statusText
      }
     if (status === "on") {
        query.open = "false"
      }
      if (issueTitle === "" && issueText === "" && createdBy === "" &&  assigned === "" &&  statusText === "" &&  status === "true") {
        res.send("no updated field sent");
      }
      else {
        MongoClient.connect(CONNECTION_STRING, function(err,db) {
            if (err) {
              res.send("There was an error");
            }
            else {  
                db.collection("issues").updateOne({_id: new ObjectId(id) }, {$set: query},function(err,result) {
                  //console.log(result) 
                  if (err || result.result.n === 0) {
                     res.send("This issue ("+id+") could not be updated");
                   }
                  else if (err || result.result.n > 0) {
                    res.send("This issue ("+id+") was successfully updated");
                  }
              });
            }
        });
      }
    })
    
    .delete(function (req, res){
  
      let id = req.body.issue_id;

        MongoClient.connect(CONNECTION_STRING, function(err,db) {
            if (err) {
              res.send("There was an error");
            }
            else {  
                db.collection("issues").removeOne({_id: new ObjectId(id)}, function(err,result) {
                  
                   if (err || result.result.n === 0) {
                     res.send("This issue ("+id+") could not be deleted");
                   }
                  else if (result.result.n > 0) {
                    res.send(" This issue ("+id+") was successfully deleted");
                  }
              });
            }
        });
      
      
    });
    
};
