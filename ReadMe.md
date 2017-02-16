爬虫架构
========

1.	url管理  
	存储有效的url，维护url列表
2.	数据存储

	-	主表  
		<table><thead><tr> <th>uid</th> <th>url</th> <th>title</th> <th>img</th> <th>price</th> <th>create_at</th> <th>update_at</th> <th>deleted_at</th></tr></thead></table> price 当前最新价格
	-	价格表 <table><tr><th>pid</th><th>uid</th><th>price</th><th>create_at</th><th>update_at</th><th>deleted_at</th></tr></table>
	-	事件表 <table><tr><th>eid</th><th>pid</th><th>event</th></tr></table>
