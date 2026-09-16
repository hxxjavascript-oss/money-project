<?php

class Database
{
    private $host;
    private $dbName;
    private $username;
    private $password;
    private $conn;

    public function __construct()
    {
        $config = require __DIR__ . '/../config/database.php';

        $this->host = $config['host'];
        $this->dbName = $config['dbName'];
        $this->username = $config['username'];
        $this->password = $config['password'];
    }

    public function getConnection()
    {
        if ($this->conn !== null) {
            return $this->conn;
        }

        try {
            $this->conn = new PDO(
                "mysql:host={$this->host};dbname={$this->dbName};charset=utf8mb4",
                $this->username,
                $this->password
            );

            $this->conn->setAttribute(
                PDO::ATTR_ERRMODE,
                PDO::ERRMODE_EXCEPTION
            );

            return $this->conn;
        } catch (PDOException $e) {
            die('数据库连接失败：' . $e->getMessage());
        }
    }
}