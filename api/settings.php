<?php

header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/src/Database.php';


function responseJson($success, $message, $data = array())
{
    echo json_encode(
        array(
            'success' => $success,
            'message' => $message,
            'data' => $data
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


try {

    $database = new Database();

    $pdo = $database->getConnection();


    $sql = "
        SELECT
            id,
            user_id,
            monthly_salary,
            take_home_salary,
            housing_fund_withdrawable,
            housing_fund_amount,
            work_hours_per_day,
            work_days_per_week,
            include_holidays,
            effective_monthly_income,
            average_monthly_work_days,
            average_daily_value,
            hourly_value,
            created_at,
            updated_at

        FROM user_settings

        WHERE user_id = 1

        LIMIT 1
    ";


    $stmt = $pdo->prepare($sql);

    $stmt->execute();

    $settings = $stmt->fetch();


    if (!$settings) {

        responseJson(
            true,
            '暂时没有保存的数据',
            array(
                'settings' => null
            )
        );
    }


    responseJson(
        true,
        '获取成功',
        array(
            'settings' => $settings
        )
    );


} catch (Exception $e) {

    responseJson(
        false,
        '服务器错误：' . $e->getMessage()
    );
}