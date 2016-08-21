# swagon :

## Use git-bash to avoid errors

**This is automation package written to make the development easy for a MEAN STACK projects**

Default mongoDB driver used: [Mongoose](https://www.npmjs.com/package/mongoose)

**This project is built on top of [swagger](https://www.npmjs.com/package/swagger). So huge shout out to them.**

To install this package : 

`npm install -g swagon`

Prereq: before you start this package mostly is driven by the YAML swagger 2.0 specifications. 


Once you are done with the installation then go to your workspace and input's that you need to give is the local path of the YAML specification file. preferably in the same folder as you would want to have the project folder.


Then run the command with respect to your YAML specification file. Let's say it's called example.yaml, then the command to run the package is :


`swagon example.yaml`


This will promt you further information to create the project structure with appropriate information.




**This project is initialized with Docker File for dockerizing the app for CICD deployement.**


The Models created will be based off on you YAML definitions, modify them as per requirement & import proper Model files in the DAO layer files located at location:

`./api/helpers/<DAO-FIles>`


**Also with in the DAO files you will need to put in appropriate Mongoose functions as per your business logic.**



With respect to calling of these DAO layered functions in the Controller files are concerned you will again have to think from you business perspective as to what arguments has to be passed to get correct collection/tables information from the database.




_Also make sure you give proper db name in the .env file created, it normally takes in the project name and appends the '_db' to it._ 



## Logging Framework : 
The logging package used for this project building is winston 

This implementation is for a specific project, based on what you need to log you can go and edit your logger file accordingly.

More information about how to use winston package can be found [here](https://www.npmjs.com/package/winston)



Happy Coding.

@author : Vaibhav Doddihal
@belief : 'Talk is cheap, show me the code' - Linus Torvalds 



