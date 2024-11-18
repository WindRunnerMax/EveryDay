# SQL Injection

`SQL` injection refers to the situation where a web application does not properly verify or filter user input data, allowing attackers to add additional `SQL` statements to the predefined queries in the web application, thus enabling illegal operations such as accessing database data and server privilege escalation. Many institutions consider `SQL` injection to be the most dangerous security vulnerability.

## Principle
`SQL` injection attacks involve modifying `SQL` statements by manipulating input in order to execute code and attack the `WEB` server. In simple terms, it involves inserting `SQL` commands into `post/get` forms, input fields, or page request query strings, ultimately causing the web server to execute malicious commands.  
`SQL` injection statements are commonly embedded in regular `HTTP` requests and are difficult to filter. Attackers can continuously adjust attack parameters, resulting in numerous variations of `SQL` injection. Furthermore, there are many `SQL` injection tools available on the internet, which can be used proficiently without requiring professional knowledge.

## Simple Example
First, create a simple table and insert an account `acc` and password `pwd` into the `user_info` table. The `qqq` table is used for testing the `drop` operation.

```sql
CREATE TABLE `user_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account` varchar(20) NOT NULL,
  `password` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=gbk;

CREATE TABLE `qqq` (
  `id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=gbk;
```
Backend use this `SQL` for querying the database, the query is concatenated with user input data, and if the query result equals `1`, it indicates a successful login.

```sql
SELECT count(*) FROM user_info WHERE account = 'acc' AND password = 'pwd'
```
If a user enters an account as `'or 1=1#`, and the backend does not filter special characters, then the query has a problem. This input also yields a `count(*)` result of `1`. The `or 1=1` operation always evaluates to `true`, and the content after `#` is commented out.

```sql
SELECT count(*) FROM user_info WHERE account = ''or 1=1#' AND password = 'pwd'
```
Furthermore, we can drop a table through injection. For example, by entering an abnormal account like `';DROP TABLE qqq#`, the `qqq` table will be dropped.

```sql
SELECT count(*) FROM user_info WHERE account = '';DROP TABLE qweqwe#' AND password = 'pwd'
```

## Injection Process

### Injection Point Detection
First, perform SQL injection point detection. By analyzing the application properly, it is possible to determine where SQL injection points exist. Typically, any dynamic web page with input submissions accessing a database may be vulnerable to SQL injection if the backend uses concatenated queries to execute `SQL`.  

### Observing System Behavior
In-band Injection: Observe whether the backend returns database error information to the frontend, allowing attackers to obtain database-related information from displayed error messages. Use `UNION ALL` to combine stolen information with legitimate information for trial and error, which can detect errors in both.  

Blind Injection: Inference injection, this form of attack does not directly display data from the target database; instead, attackers carefully examine indirect clues in the behavior. Detailed information in `HTTP` responses, certain user input blank pages, and database responses that take a certain amount of time based on user input can all be clues, depending on the attacker's objective.  

Out-of-Band Injection: This type of attack is somewhat complex, as attackers craft SQL statements that, when presented to the database, trigger the system to create a connection to an external server controlled by the attacker. In this manner, attackers can gather data or possibly control the behavior of the database.

### Data Acquisition
Check the field length, determine the field echo location, verify the database information, look for database table names, search for field names, and then construct injection `SQL` based on this information for injection, log in to the background, steal data, and carry out server privilege escalation and other operations.


## Defense
 
### Hierarchical Management
Carry out hierarchical management for users, strictly control user permissions, and for ordinary users, prohibit database creation, deletion, modification, and other related permissions, with only system administrators having permissions for addition, deletion, modification, and access.


### Intercepting Requests
Intercept abnormal requests that match regular expressions, such as `\s+(or|xor|and)\s+.*(=|<|>|'|")`, `select.+(from|limit)`, `(?:(union(.*?)select))`, `(?:(?:current_)user|database|schema|connection_id)\s*\(`, and so on.

### Parameter Filtering
Filter sensitive characters submitted, such as `'`, `"`, `:`, `\`, `;`, and more.

### Variable Checking
Determine the data type of variables, for example, check the incoming `id` for an `int` type, and strictly check the email format for incoming emails.

### Error Concealment
Avoid directly displaying database errors to users, as attackers can use these error messages to obtain information about the database.

### Prepared Statement Set
Use prepared statement sets, which are built-in with the ability to handle `SQL` injection, greatly improving security.

### Firewall
Use a Web Application Firewall (WAF) for web applications accessing the database, which can help identify attempts of `SQL` injection.

### Regular Checks
Regularly test web applications that interact with the database and update the database to the latest available patches to prevent exploitation of vulnerabilities in old versions.

## Daily Question

```
https://github.com/WindrunnerMax/EveryDay
```