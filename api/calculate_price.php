<?php

header('Content-Type: application/json; charset=utf-8');

require_once '../src/Database.php';

try {

    // =========================
    // 获取用户提交的数据
    // =========================

    $input = file_get_contents('php://input');

    $data = json_decode($input, true);

    if (!is_array($data)) {

        throw new Exception('提交的数据格式错误');

    }


    // =========================
    // 获取商品名称
    // =========================

    $itemName = isset($data['item_name'])
        ? trim($data['item_name'])
        : '';


    // =========================
    // 获取价格
    // =========================

    $price = isset($data['price'])
        ? floatval($data['price'])
        : 0;


    // =========================
    // 基础验证
    // =========================

    if ($itemName === '') {

        throw new Exception('请输入商品名称');

    }


    if ($price <= 0) {

        throw new Exception('请输入正确的价格');

    }


    // =========================
    // 连接数据库
    // =========================

    $database = new Database();

    $pdo = $database->getConnection();


    // =========================
    // 获取当前用户的时间价值
    // =========================

    $sql = "
        SELECT
            hourly_value,
            average_daily_value,
            work_hours_per_day
        FROM user_settings
        WHERE user_id = 1
        LIMIT 1
    ";

    $stmt = $pdo->prepare($sql);

    $stmt->execute();

    $settings = $stmt->fetch();


    // =========================
    // 判断是否已经设置收入
    // =========================

    if (!$settings) {

        throw new Exception(
            '请先完成收入与工作设置'
        );

    }


    $hourlyValue =
        floatval($settings['hourly_value']);

    $dailyValue =
        floatval($settings['average_daily_value']);

    $workHoursPerDay =
        floatval($settings['work_hours_per_day']);


    if ($hourlyValue <= 0) {

        throw new Exception(
            '你的时间价值还没有计算出来，请先完成收入设置'
        );

    }


    // =========================
    // 计算需要工作的小时数
    // =========================

    $workHours =
        $price / $hourlyValue;


    // =========================
    // 转换成小时 + 分钟
    // =========================

    $hours =
        floor($workHours);

    $minutes =
        round(($workHours - $hours) * 60);


    // 防止出现 60 分钟
    if ($minutes >= 60) {

        $hours += 1;

        $minutes = 0;

    }


    // =========================
    // 计算工作天数
    // =========================

    $workDays = 0;

    if ($workHoursPerDay > 0) {

        $workDays =
            $workHours / $workHoursPerDay;

    }


    // =========================
    // 返回结果
    // =========================

    echo json_encode(
        array(
            'success' => true,

            'message' => '计算成功',

            'data' => array(

                'item_name' => $itemName,

                'price' => round($price, 2),

                'hourly_value' => round(
                    $hourlyValue,
                    2
                ),

                'work_hours' => round(
                    $workHours,
                    2
                ),

                'hours' => intval($hours),

                'minutes' => intval($minutes),

                'work_days' => round(
                    $workDays,
                    2
                )

            ),

            'errors' => array()

        ),
        JSON_UNESCAPED_UNICODE
    );


} catch (Exception $e) {

    http_response_code(400);

    echo json_encode(
        array(
            'success' => false,

            'message' => $e->getMessage(),

            'data' => null,

            'errors' => array(
                $e->getMessage()
            )

        ),
        JSON_UNESCAPED_UNICODE
    );

}