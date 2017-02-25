1.	url管理
----------

### url 追踪表

| 字段 | 说明 | 类型   | 默认值 |
|------|------|--------|--------|
| id   | id   | int    | \-     |
| url  | 链接 | string | \-     |

2.	数据存储
-----------

### immutable 不变表 商品表

| 字段      | 说明     | 类型   | 默认值 |
|-----------|----------|--------|--------|
| id        | id       | int    | \-     |
| name      | 名字     | string | \-     |
| href      | 链接     | string | \-     |
| image_url | 图片链接 | string | \-     |

### mutable 可变表

| 字段      | 说明   | 类型     | 默认值 |
|-----------|--------|----------|--------|
| id        | id     | int      | \-     |
| computers | 电脑类 | computer | \-     |

#### computer 电脑

| 字段          | 说明         | 类型  | 默认值 |
|---------------|--------------|-------|--------|
| id            | immutable.id | int   | \-     |
| price         | 价格         | float | \-     |
| comments      | 评论数       | int   | \-     |
| good_count    | 好评数       | int   | \-     |
| general_count | 一般数       | int   | \-     |
| poor_count    | 差评数       | int   | \-     |
| create_at     | 记录创建日期 | date  | \-     |
