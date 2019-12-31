<?php
class DB{
 /**
 * 仿真 Adodb 函数
 * @link http://www.ma863.com/
 * @author  zhang 
 * @version 0.0.1 2019-12-31
 */
	public static function id($set=null){
		static $id=1;
		if(is_null($set)){
			return $id;
		}
		$id=$set;
	}
	/* 查询语句    还要改*/
	public static function q($sql, $params =array(),$type=''){
		return DB::do($sql, $params,$type);
	}

	/* 执行语句 */
	public static function e($sql, $params =array(),$type=''){
		return DB::do($sql, $params,$type)->affected_rows;

	}
	/* 插入语句 */
	public static function i($sql, $params =array(),$type=''){
		return DB::do($sql, $params,$type)->insert_id;
	}
	/* 干活的   不外用 只本类用  方便读写分离*/
	public static function do($sql, $params =array(),$type=''){
		$start=microtime(true);
		$stmt = DB::link(DB::id())->prepare(str_replace('#je#_','je_',$sql));		
		if(!$stmt)return false;
		if($params){
			if($type=='')
			foreach($params as $k=>$v){
				$type.=is_int($v)?'i':'s';
				#$type.='s';
			}
			array_unshift($params,$type);
			call_user_func_array(array($stmt,'bind_param'), DB::refValues($params));			
		}
		$stmt->execute();		
		DB::N('db_query_time',microtime(true)-$start);
		DB::N('db_query',1);
		return $stmt;
	}
	public static function get_query_num() {
		return DB::N('db_query');
	}
	public static function get_query_time() {
		return DB::N('db_query_time');
	}
	 /**
	 *getOne: 
	 *执行SQL指令，回传第一条记录第一列值。或 false
	 *不带参数,则返回上次查询第N笔记录的第一个栏位。
	 * @param   $sql
	 * @return  第一条记录第一列值,或 false
	 * @version 0.0.1 2010-03-10
	 */	 
	public static function getOne($sql=NULL, $limited = false)
	{
		static $result;
		if ($limited == true)	$sql = trim($sql . ' LIMIT 1');
		if($sql!==NULL)//有查询则查询且保存,没查询则取得上次结果集
		{	
			$res =  DB::query($sql);
			$result=$res;
		}else	$res=$result;
		
		if ($res !== false)
		{  
			if ($row =DB::fetch($res,MYSQL_NUM)) return $row[0]; else return '';
		}
		else return false;
	}	 

	/**
	 *  查询,返回$num条记录
	 * @param   $num
	 * @param   $start = 0
	 * @return  result集或false	
	 * @version 0.0.1 2010-03-10
	 */	 
	public static function selectLimit($sql, $num, $start = 0)
	{
		if ($start == 0)
			$sql .= ' LIMIT ' . $num;
		else
			$sql .= ' LIMIT ' . $start . ', ' . $num;
		return DB::query($sql);
	}
	 /**
	 *  查询,返回所有记录的关联数组
	 * @param   $sql
	 * @param   $type 为对应数椐类型‘idsb’
	 * @return  结果二维数组或false		
	 * @version 0.0.1 2010-03-10
	 */	 
	public static function getAll($sql, $params =array(),$type=''){
		$stmt=DB::q($sql,$params ,$type);
		if($stmt->affected_rows){
			$result = $stmt->get_result();
			if($result){
				return $result->fetch_all(MYSQLI_ASSOC);
			}
		}
		return false;
	}

	/**
	 *  查询,返回第一条记录的关联数组
	 *  参数为空,依次返回上次结果集记录
	 * @param   $sql 
	 * @param  $limited=true   加限制条件' LIMIT 1'
	 * @return  结果数组或false	
	 * @version 0.0.1 2010-03-10
	 */	
	public static function getRow($sql=NULL, $limited = false, $params =array(),$type='')
	{
		static $query;
		if ($limited == true)	$sql = trim($sql . ' LIMIT 1');
		if($sql!==NULL)
		{			
			$res = DB::query($sql);
			$query=$res;
		}
		else $res=$query;
		
		if ($res !== false)
			return DB::fetch($res);
		else
			return false;
	}
	 /**
	 *  取得$sql的多条记录的第一列返回为一维数组,关键字为数字
	 * @param   $sql 
	 * @return  结果数组或false
	 * @version 0.0.1 2010-03-10
	 */	
	public static function getCol($sql)
	{
		$res =DB::query($sql);
		if ($res !== false)
		{
			$arr = array();
			while ($row = DB::fetch($res,MYSQLI_NUM))
			{
				$arr[] = $row[0];
			}
			return $arr;
		}
		else return false;
	}



	public static function delete($table, $condition, $limit = 0) {
		if(empty($condition)) {
			$where = '1';
		} elseif(is_array($condition)) {
			$where = DB::implode_field_value($condition, ' AND ');
		} else {
			$where = $condition;
		}
		$sql = "DELETE FROM ".DB::table($table)." WHERE $where ".($limit ? "LIMIT $limit" : '');
		return DB::e($sql);
	}

	public static function insert($table, $data) {
		$sql=$key=$value='';
		$params=array();
		foreach ($data as $k => $v) {
			$key.= '`'.$k.'`,';//加反引号
			$value.= '?,';
			$params[]=$v;
		}
		$key=rtrim($key,',');
		$value=rtrim($value,',');
		$sql='insert '.DB::table($table).' ('.$key.') value ('.$value.')';
		return DB::i($sql, $params);
	}
	public static function refValues($arr){
		$refs = array();
		foreach($arr as $key => $value){
			if($key)$refs[$key] = &$arr[$key]; else $refs[$key] = $arr[$key]; 
		}
		return $refs;
	}
	public static function update($table, $data, $condition, $low_priority = false) {
		if(!$condition)die('no condition');
		$sql=$set='';
		$params=array();
		foreach ($data as $k => $v) {
			$set.= '`'.$k.'`';//加反引号   三行与"`$k`=?,"一样
			$set.='=';
			$set.= '?,';
			$params[]=$v;
		}
		$set=rtrim($set,',');
		$sql='UPDATE'.($low_priority ? ' LOW_PRIORITY ' : ' ') .DB::table($table).' set '.$set .' where '.$condition;
		return DB::e($sql, $params);
	}

	public static function implode_field_value($array, $glue = ',') {
		$sql = $comma = '';
		foreach ($array as $k => $v) {
			$sql .= $comma."`$k`='$v'";
			$comma = $glue;
		}
		return $sql;
	}
	
	public static function implode_in($array, $glue = ',') {
		$sql = $comma = '';
		foreach ($array as $k => $v) {
			$sql .= $comma."'$v'";
			$comma = $glue;
		}
		return $sql;
	}


	public static function fetch($resourceid, $type = MYSQLI_ASSOC) {//没有 MYSQLI_BOTH
		if($type===MYSQLI_ASSOC)
			return $resourceid->fetch_assoc();	
		return $resourceid->fetch_row();
	}

	public static function fetch_first($sql,$params =array(),$type='') {//取第一行
		return DB::query($sql,$params,$type)->fetch_assoc();
	}

	public static function result_first($sql,$params =array(),$type='') {//返回第一个字段
		$t=DB::query($sql,$params,$type)->fetch_row();
		return $t[0];
	}
	public static function query($sql, $params =array(),$type='') {
		return DB::q($sql,$params,$type)->get_result();	
	}

	public static function free_result($query) {
		return $query->free();
	}

	public static function error() {
		return DB::link()->error;
	}

	public static function errno() {
		return DB::link()->errno;
	}

	public static function table($table) {
		return $GLOBALS['config']['db'][DB::id()]['tablepre'].$table;
	}
	public static function tablepre() {
		return $GLOBALS['config']['db'][DB::id()]['tablepre'];
	}
	public static function link($id =1) {
		static $db=array();
		if(empty($db[$id])){
			$db[$id] = new mysqli();
			$c=&$GLOBALS['config']['db'][$id];
			if(!$db[$id]->real_connect($c['dbhost'], $c['dbuser'],$c['dbpw'], $c['dbname'], null, null, MYSQLI_CLIENT_COMPRESS)) {
				self::halt($db[$id]->connect_error, $db[$id]->errno);
			}
			$db[$id]->set_charset($c['dbcharset']);
			$serverset =$db[$id]->server_info > '5.0.1' ? 'sql_mode=\'\',' : '';
			$serverset .= 'character_set_client=binary';
			$db[$id]->query('SET '.$serverset);
			//$db[$id]->select_db($c['dbname']);
		}
		return $db[$id];
	}

	public static function halt($message = '', $code = 0, $sql = '') {
		if($sql) echo $sql."\n";
		if($code) echo $code."\n";
		if($message) echo $message."\n";
	}
	/**
	 * 设置和获取统计数据
	 * 使用方法:
	 * <code>
	 * N('db',1); // 记录数据库操作次数
	 * N('read',1); // 记录读取次数
	 * echo N('db'); // 获取当前页面数据库的所有操作次数
	 * echo N('read'); // 获取当前页面读取次数
	 * </code> 
	 * @param string $key 标识位置
	 * @param integer $step 步进值
	 * @return mixed
	 */
	public static function N($key, $step=0) {
		static $_num    = array();
		if (!isset($_num[$key])) {
			$_num[$key] = 0;
		}
		if (empty($step))
			return $_num[$key];
		else
			$_num[$key] = $_num[$key] + $step;	
	}
}
