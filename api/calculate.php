<?php

header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/src/Database.php';


function responseJson($success, $message, $data = array(), $errors = array())
{
    echo json_encode(
        array(
            'success' => $success,
            'message' => $message,
            'data' => $data,
            'errors' => $errors
        ),
        JSON_UNESCAPED_UNICODE
    );

    exit;
}


try {

    /*
     * 获取前端 JSON
     */

    $raw = file_get_contents('php://input');

    $input = json_decode($raw, true);

    if (!is_array($input)) {

        responseJson(
            false,
            '提交的数据格式错误'
        );
    }


    /*
     * 获取数据
     */

    $monthlySalary = isset($input['monthly_salary'])
        ? floatval($input['monthly_salary'])
        : 0;

    $takeHomeSalary = isset($input['take_home_salary'])
        ? floatval($input['take_home_salary'])
        : 0;

    $housingFundWithdrawable =
        isset($input['housing_fund_withdrawable'])
        ? intval($input['housing_fund_withdrawable'])
        : 0;

    $housingFundAmount =
        isset($input['housing_fund_amount'])
        ? floatval($input['housing_fund_amount'])
        : 0;

    $workHoursPerDay =
        isset($input['work_hours_per_day'])
        ? floatval($input['work_hours_per_day'])
        : 0;

    $workDaysPerWeek =
        isset($input['work_days_per_week'])
        ? floatval($input['work_days_per_week'])
        : 0;

    $includeHolidays =
        isset($input['include_holidays'])
        ? intval($input['include_holidays'])
        : 1;


    /*
     * 数据验证
     */

    $errors = array();


    if ($monthlySalary <= 0) {

        $errors['monthly_salary'] =
            '请输入正确的税前工资';
    }


    if ($takeHomeSalary <= 0) {

        $errors['take_home_salary'] =
            '请输入正确的实际到手工资';
    }


    if ($workHoursPerDay <= 0 ||
        $workHoursPerDay > 24) {

        $errors['work_hours_per_day'] =
            '每天工作时间必须大于0且不超过24小时';
    }


    if ($workDaysPerWeek <= 0 ||
        $workDaysPerWeek > 7) {

        $errors['work_days_per_week'] =
            '每周工作天数必须在1到7天之间';
    }


    if ($housingFundWithdrawable == 1) {

        if ($housingFundAmount < 0) {

            $errors['housing_fund_amount'] =
                '公积金金额不能为负数';
        }
    }


    if (count($errors) > 0) {

        responseJson(
            false,
            '请检查填写的数据',
            array(),
            $errors
        );
    }


    /*
     * 如果公积金不能提取
     * 就不计入实际收入
     */

    if ($housingFundWithdrawable != 1) {

        $housingFundAmount = 0;
    }


    /*
     * 实际每月可以获得的钱
     */

    $effectiveMonthlyIncome =
        $takeHomeSalary +
        $housingFundAmount;


    /*
     * 根据每周工作天数
     * 计算平均每月工作天数
     *
     * 365天 / 7天 × 每周工作天数
     * 得到一年平均工作天数
     *
     * 再除以12
     */

    $annualWorkDays =
        365 * $workDaysPerWeek / 7;

    $averageMonthlyWorkDays =
        $annualWorkDays / 12;


    /*
     * 平均每天实际收入
     */

    $averageDailyValue =
        $effectiveMonthlyIncome /
        $averageMonthlyWorkDays;


    /*
     * 平均每小时实际收入
     */

    $hourlyValue =
        $averageDailyValue /
        $workHoursPerDay;


    /*
     * 保存数据库
     */

    $database = new Database();

    $pdo = $database->getConnection();


    $sql = "
        INSERT INTO user_settings
        (
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
            hourly_value
        )
        VALUES
        (
            1,
            :monthly_salary,
            :take_home_salary,
            :housing_fund_withdrawable,
            :housing_fund_amount,
            :work_hours_per_day,
            :work_days_per_week,
            :include_holidays,
            :effective_monthly_income,
            :average_monthly_work_days,
            :average_daily_value,
            :hourly_value
        )

        ON DUPLICATE KEY UPDATE

            monthly_salary =
                VALUES(monthly_salary),

            take_home_salary =
                VALUES(take_home_salary),

            housing_fund_withdrawable =
                VALUES(housing_fund_withdrawable),

            housing_fund_amount =
                VALUES(housing_fund_amount),

            work_hours_per_day =
                VALUES(work_hours_per_day),

            work_days_per_week =
                VALUES(work_days_per_week),

            include_holidays =
                VALUES(include_holidays),

            effective_monthly_income =
                VALUES(effective_monthly_income),

            average_monthly_work_days =
                VALUES(average_monthly_work_days),

            average_daily_value =
                VALUES(average_daily_value),

            hourly_value =
                VALUES(hourly_value),

            updated_at =
                CURRENT_TIMESTAMP
    ";


    $stmt = $pdo->prepare($sql);


    $stmt->execute(
        array(

            ':monthly_salary' =>
                $monthlySalary,

            ':take_home_salary' =>
                $takeHomeSalary,

            ':housing_fund_withdrawable' =>
                $housingFundWithdrawable,

            ':housing_fund_amount' =>
                $housingFundAmount,

            ':work_hours_per_day' =>
                $workHoursPerDay,

            ':work_days_per_week' =>
                $workDaysPerWeek,

            ':include_holidays' =>
                $includeHolidays,

            ':effective_monthly_income' =>
                $effectiveMonthlyIncome,

            ':average_monthly_work_days' =>
                $averageMonthlyWorkDays,

            ':average_daily_value' =>
                $averageDailyValue,

            ':hourly_value' =>
                $hourlyValue
        )
    );


    /*
     * 返回结果
     */

    responseJson(
        true,
        '计算成功',

        array(

            'result' => array(

                'effective_monthly_income' =>
                    round($effectiveMonthlyIncome, 2),

                'average_monthly_work_days' =>
                    round($averageMonthlyWorkDays, 2),

                'average_daily_value' =>
                    round($averageDailyValue, 2),

                'hourly_value' =>
                    round($hourlyValue, 2)
            )
        )
    );


} catch (Exception $e) {

    responseJson(
        false,
        '服务器错误：' . $e->getMessage()
    );
}