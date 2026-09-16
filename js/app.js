document.addEventListener('DOMContentLoaded', function () {


var API_SETTINGS = './api/settings.php';
var API_CALCULATE = './api/calculate.php';
var API_PRICE = './api/calculate_price.php';


// =========================================================
// 页面
// =========================================================

var homePage = document.getElementById('homePage');
var spendPage = document.getElementById('spendPage');
var settingsPage = document.getElementById('settingsPage');

var goSpendPage = document.getElementById('goSpendPage');
var goSettingsPage = document.getElementById('goSettingsPage');

var backFromSpend = document.getElementById('backFromSpend');
var backFromSettings = document.getElementById('backFromSettings');

var homeHourlyValue =
    document.getElementById('homeHourlyValue');


// =========================================================
// 表单元素
// =========================================================

var monthlySalary =
    document.getElementById('monthlySalary');

var takeHomeSalary =
    document.getElementById('takeHomeSalary');

var housingFundAmount =
    document.getElementById('housingFundAmount');

var housingFundAmountBox =
    document.getElementById('housingFundAmountBox');

var workHours =
    document.getElementById('workHours');

var workDays =
    document.getElementById('workDays');

var resultCard =
    document.getElementById('resultCard');

var calculateBtn =
    document.getElementById('calculateBtn');

var notice =
    document.getElementById('notice');


// =========================================================
// 消费元素
// =========================================================

var itemName =
    document.getElementById('itemName');

var itemPrice =
    document.getElementById('itemPrice');

var calculatePriceBtn =
    document.getElementById('calculatePriceBtn');

var priceResultCard =
    document.getElementById('priceResultCard');


// =========================================================
// 页面切换
// =========================================================

function showPage(page) {

    if (homePage) {
        homePage.classList.add('hidden');
    }

    if (spendPage) {
        spendPage.classList.add('hidden');
    }

    if (settingsPage) {
        settingsPage.classList.add('hidden');
    }


    if (page) {
        page.classList.remove('hidden');
    }


    window.scrollTo(0, 0);

}


// =========================================================
// 首页 → 我想花钱
// =========================================================

if (goSpendPage) {

    goSpendPage.addEventListener(
        'click',
        function () {

            showPage(spendPage);

        }
    );

}


// =========================================================
// 首页 → 收入设置
// =========================================================

if (goSettingsPage) {

    goSettingsPage.addEventListener(
        'click',
        function () {

            showPage(settingsPage);

        }
    );

}


// =========================================================
// 我想花钱 → 首页
// =========================================================

if (backFromSpend) {

    backFromSpend.addEventListener(
        'click',
        function () {

            showPage(homePage);

        }
    );

}


// =========================================================
// 收入设置 → 首页
// =========================================================

if (backFromSettings) {

    backFromSettings.addEventListener(
        'click',
        function () {

            showPage(homePage);

        }
    );

}


// =========================================================
// 页面打开时读取数据库
// =========================================================

loadSettings();


// =========================================================
// 公积金选项
// =========================================================

var housingFundRadios =
    document.querySelectorAll(
        'input[name="housingFund"]'
    );


housingFundRadios.forEach(
    function (radio) {

        radio.addEventListener(
            'change',
            function () {

                if (this.value === '1') {

                    housingFundAmount.disabled =
                        false;


                    if (housingFundAmountBox) {

                        housingFundAmountBox.style.display =
                            'block';

                    }

                } else {

                    housingFundAmount.disabled =
                        true;

                    housingFundAmount.value =
                        '';


                    if (housingFundAmountBox) {

                        housingFundAmountBox.style.display =
                            'none';

                    }

                }

            }
        );

    }
);


// =========================================================
// 每周工作天数快捷按钮
// =========================================================

var quickButtons =
    document.querySelectorAll(
        '.quick-buttons button'
    );


quickButtons.forEach(
    function (button) {

        button.addEventListener(
            'click',
            function () {

                var days =
                    this.getAttribute(
                        'data-days'
                    );


                if (workDays) {

                    workDays.value =
                        days;

                }

            }
        );

    }
);


// =========================================================
// 工资计算按钮
// =========================================================

if (calculateBtn) {

    calculateBtn.addEventListener(
        'click',
        function () {

            calculate();

        }
    );

}


// =========================================================
// 工资计算
// =========================================================

function calculate() {

    clearErrors();


    var monthlySalaryValue =
        parseFloat(
            monthlySalary.value
        );


    var takeHomeSalaryValue =
        parseFloat(
            takeHomeSalary.value
        );


    var workHoursValue =
        parseFloat(
            workHours.value
        );


    var workDaysValue =
        parseFloat(
            workDays.value
        );


    // =====================================================
    // 获取公积金
    // =====================================================

    var housingFundRadio =
        document.querySelector(
            'input[name="housingFund"]:checked'
        );


    var housingFundWithdrawable = 0;

    var housingFundValue = 0;


    if (housingFundRadio) {

        housingFundWithdrawable =
            parseInt(
                housingFundRadio.value,
                10
            );

    }


    if (
        housingFundWithdrawable === 1
    ) {

        housingFundValue =
            parseFloat(
                housingFundAmount.value
            ) || 0;

    }


    // =====================================================
    // 获取法定节假日
    // =====================================================

    var holidayRadio =
        document.querySelector(
            'input[name="includeHolidays"]:checked'
        );


    var includeHolidays = 1;


    if (holidayRadio) {

        includeHolidays =
            parseInt(
                holidayRadio.value,
                10
            );

    }


    // =====================================================
    // 基础验证
    // =====================================================

    if (
        !monthlySalaryValue ||
        monthlySalaryValue <= 0
    ) {

        showError(
            'monthlySalaryError',
            '请输入正确的月工资'
        );

        return;

    }


    if (
        !takeHomeSalaryValue ||
        takeHomeSalaryValue <= 0
    ) {

        showError(
            'takeHomeSalaryError',
            '请输入正确的实际到手工资'
        );

        return;

    }


    if (
        !workHoursValue ||
        workHoursValue <= 0
    ) {

        showError(
            'workHoursError',
            '请输入正确的每天工作小时数'
        );

        return;

    }


    if (
        !workDaysValue ||
        workDaysValue <= 0 ||
        workDaysValue > 7
    ) {

        showError(
            'workDaysError',
            '每周工作天数应在 1～7 天之间'
        );

        return;

    }


    if (
        housingFundWithdrawable === 1 &&
        housingFundValue < 0
    ) {

        alert(
            '请输入正确的公积金金额'
        );

        return;

    }


    // =====================================================
    // 准备数据
    // =====================================================

    var payload = {

        monthly_salary:
            monthlySalaryValue,

        take_home_salary:
            takeHomeSalaryValue,

        housing_fund_withdrawable:
            housingFundWithdrawable,

        housing_fund_amount:
            housingFundValue,

        work_hours_per_day:
            workHoursValue,

        work_days_per_week:
            workDaysValue,

        include_holidays:
            includeHolidays

    };


    console.log(
        '发送计算数据：',
        payload
    );


    // =====================================================
    // 请求 PHP
    // =====================================================

    calculateBtn.disabled = true;

    calculateBtn.textContent =
        '计算中...';


    fetch(
        API_CALCULATE,
        {

            method: 'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify(payload)

        }
    )

    .then(
        function (response) {

            return response.text();

        }
    )

    .then(
        function (text) {

            console.log(
                'calculate.php 返回：',
                text
            );


            var result;


            try {

                result =
                    JSON.parse(text);

            } catch (e) {

                console.error(
                    'JSON解析失败：',
                    e
                );

                alert(
                    '服务器返回的数据不是正确的 JSON，请按 F12 查看 Console'
                );

                return;

            }


            if (!result.success) {

                alert(
                    result.message ||
                    '计算失败'
                );

                return;

            }


            // =================================================
            // 显示结果
            // =================================================

            renderResult(
                result.data.result
            );


            // 更新首页
            updateHomeHourlyValue(
                result.data.result.hourly_value
            );


            if (notice) {

                notice.textContent =
                    '计算成功，数据已经保存';

                notice.classList.add(
                    'show',
                    'success'
                );

            }

        }
    )

    .catch(
        function (error) {

            console.error(
                '请求失败：',
                error
            );

            alert(
                '请求服务器失败，请检查 Apache 和 PHP'
            );

        }
    )

    .finally(
        function () {

            calculateBtn.disabled =
                false;

            calculateBtn.textContent =
                '保存并计算我的时间价值';

        }
    );

}


// =========================================================
// 从数据库读取设置
// =========================================================

function loadSettings() {

    fetch(API_SETTINGS)

    .then(
        function (response) {

            return response.text();

        }
    )

    .then(
        function (text) {

            console.log(
                'settings.php 返回：',
                text
            );


            var result;


            try {

                result =
                    JSON.parse(text);

            } catch (e) {

                console.error(
                    'settings.php JSON解析失败：',
                    e
                );

                return;

            }


            if (!result.success) {

                console.log(
                    '读取设置失败：',
                    result.message
                );

                return;

            }


            var settings =
                result.data.settings;


            // =================================================
            // 第一次使用，没有数据
            // =================================================

            if (!settings) {

                console.log(
                    '数据库中暂时没有收入设置'
                );

                return;

            }


            // =================================================
            // 填充工资
            // =================================================

            monthlySalary.value =
                settings.monthly_salary;


            takeHomeSalary.value =
                settings.take_home_salary;


            // =================================================
            // 填充公积金
            // =================================================

            var housingFundRadios =
                document.querySelectorAll(
                    'input[name="housingFund"]'
                );


            housingFundRadios.forEach(
                function (radio) {

                    radio.checked =
                        String(
                            radio.value
                        ) ===
                        String(
                            settings.housing_fund_withdrawable
                        );

                }
            );


            if (
                String(
                    settings.housing_fund_withdrawable
                ) === '1'
            ) {

                housingFundAmount.disabled =
                    false;


                housingFundAmount.value =
                    settings.housing_fund_amount;


                if (housingFundAmountBox) {

                    housingFundAmountBox.style.display =
                        'block';

                }

            } else {

                housingFundAmount.disabled =
                    true;


                housingFundAmount.value =
                    '';


                if (housingFundAmountBox) {

                    housingFundAmountBox.style.display =
                        'none';

                }

            }


            // =================================================
            // 工作时间
            // =================================================

            workHours.value =
                settings.work_hours_per_day;


            workDays.value =
                settings.work_days_per_week;


            // =================================================
            // 法定节假日
            // =================================================

            var holidayRadios =
                document.querySelectorAll(
                    'input[name="includeHolidays"]'
                );


            holidayRadios.forEach(
                function (radio) {

                    radio.checked =
                        String(
                            radio.value
                        ) ===
                        String(
                            settings.include_holidays
                        );

                }
            );


            // =================================================
            // 自动显示之前的结果
            // =================================================

            if (
                parseFloat(
                    settings.effective_monthly_income
                ) > 0
            ) {

                var savedResult = {

                    effective_monthly_income:
                        parseFloat(
                            settings.effective_monthly_income
                        ),

                    average_monthly_work_days:
                        parseFloat(
                            settings.average_monthly_work_days
                        ),

                    average_daily_value:
                        parseFloat(
                            settings.average_daily_value
                        ),

                    hourly_value:
                        parseFloat(
                            settings.hourly_value
                        )

                };


                renderResult(
                    savedResult
                );


                // 首页显示小时价值
                updateHomeHourlyValue(
                    savedResult.hourly_value
                );

            }


            console.log(
                '收入设置读取成功'
            );

        }
    )

    .catch(
        function (error) {

            console.error(
                '读取收入设置失败：',
                error
            );

        }
    );

}


// =========================================================
// 显示工资计算结果
// =========================================================

function renderResult(result) {

    var effectiveIncome =
        parseFloat(
            result.effective_monthly_income
        ) || 0;


    var monthlyWorkDays =
        parseFloat(
            result.average_monthly_work_days
        ) || 0;


    var dailyValue =
        parseFloat(
            result.average_daily_value
        ) || 0;


    var hourlyValue =
        parseFloat(
            result.hourly_value
        ) || 0;


    var tenMinutesValue =
        hourlyValue / 6;


    var thirtyMinutesValue =
        hourlyValue / 2;


    // =====================================================
    // 获取结果元素
    // =====================================================

    var monthlyResult =
        document.getElementById(
            'monthlyResult'
        );


    var dailyResult =
        document.getElementById(
            'dailyResult'
        );


    var hourlyResult =
        document.getElementById(
            'hourlyResult'
        );


    var hourlyText =
        document.getElementById(
            'hourlyText'
        );


    var tenMinutesText =
        document.getElementById(
            'tenMinutesText'
        );


    var thirtyMinutesText =
        document.getElementById(
            'thirtyMinutesText'
        );


    var workDaysText =
        document.getElementById(
            'workDaysText'
        );


    // =====================================================
    // 写入页面
    // =====================================================

    if (monthlyResult) {

        monthlyResult.textContent =
            '¥' +
            effectiveIncome.toFixed(2);

    }


    if (dailyResult) {

        dailyResult.textContent =
            '¥' +
            dailyValue.toFixed(2);

    }


    if (hourlyResult) {

        hourlyResult.textContent =
            '¥' +
            hourlyValue.toFixed(2);

    }


    if (hourlyText) {

        hourlyText.textContent =
            '¥' +
            hourlyValue.toFixed(2);

    }


    if (tenMinutesText) {

        tenMinutesText.textContent =
            '¥' +
            tenMinutesValue.toFixed(2);

    }


    if (thirtyMinutesText) {

        thirtyMinutesText.textContent =
            '¥' +
            thirtyMinutesValue.toFixed(2);

    }


    if (workDaysText) {

        workDaysText.textContent =
            '按照目前设置，每月平均工作约 ' +
            monthlyWorkDays.toFixed(2) +
            ' 天。';

    }


    // =====================================================
    // 显示结果
    // =====================================================

    if (resultCard) {

        resultCard.classList.remove(
            'hidden'
        );

    }

}


// =========================================================
// 首页显示小时价值
// =========================================================

function updateHomeHourlyValue(value) {

    if (!homeHourlyValue) {

        return;

    }


    var hourlyValue =
        parseFloat(value) || 0;


    if (hourlyValue <= 0) {

        homeHourlyValue.textContent =
            '¥0.00';

        return;

    }


    homeHourlyValue.textContent =
        '¥' +
        hourlyValue.toFixed(2);

}


// =========================================================
// 错误
// =========================================================

function showError(id, message) {

    var element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            message;

    }

}


function clearErrors() {

    var errors =
        document.querySelectorAll(
            '.error'
        );


    errors.forEach(
        function (element) {

            element.textContent =
                '';

        }
    );

}


// =========================================================
// 消费真实价格
// =========================================================

if (calculatePriceBtn) {

    calculatePriceBtn.addEventListener(
        'click',
        function () {

            calculateRealPrice();

        }
    );

}


function calculateRealPrice() {

    var name =
        itemName.value.trim();


    var price =
        parseFloat(
            itemPrice.value
        );


    // =====================================================
    // 验证
    // =====================================================

    if (name === '') {

        alert(
            '请输入你想买的东西'
        );

        return;

    }


    if (!price || price <= 0) {

        alert(
            '请输入正确的价格'
        );

        return;

    }


    // =====================================================
    // 提交
    // =====================================================

    calculatePriceBtn.disabled =
        true;


    calculatePriceBtn.textContent =
        '计算中...';


    fetch(
        API_PRICE,
        {

            method: 'POST',

            headers: {

                'Content-Type':
                    'application/json'

            },

            body:
                JSON.stringify({

                    item_name:
                        name,

                    price:
                        price

                })

        }
    )

    .then(
        function (response) {

            return response.text();

        }
    )

    .then(
        function (text) {

            console.log(
                'calculate_price.php 返回：',
                text
            );


            var result;


            try {

                result =
                    JSON.parse(text);

            } catch (e) {

                console.error(
                    'JSON解析失败：',
                    e
                );

                alert(
                    '服务器返回的数据不是正确 JSON'
                );

                return;

            }


            if (!result.success) {

                alert(
                    result.message ||
                    '计算失败'
                );

                return;

            }


            // =================================================
            // 显示结果
            // =================================================

            var data =
                result.data;


            var itemPriceResult =
                document.getElementById(
                    'itemPriceResult'
                );


            var workTimeResult =
                document.getElementById(
                    'workTimeResult'
                );


            var workDaysResult =
                document.getElementById(
                    'workDaysResult'
                );


            var hourlyValueResult =
                document.getElementById(
                    'hourlyValueResult'
                );


            if (itemPriceResult) {

                itemPriceResult.textContent =
                    '¥' +
                    parseFloat(
                        data.price
                    ).toFixed(2);

            }


            if (workTimeResult) {

                workTimeResult.textContent =
                    data.hours +
                    '小时' +
                    data.minutes +
                    '分钟';

            }


            if (workDaysResult) {

                workDaysResult.textContent =
                    parseFloat(
                        data.work_days
                    ).toFixed(2);

            }


            if (hourlyValueResult) {

                hourlyValueResult.textContent =
                    '¥' +
                    parseFloat(
                        data.hourly_value
                    ).toFixed(2);

            }


            if (priceResultCard) {

                priceResultCard.classList.remove(
                    'hidden'
                );


                priceResultCard.scrollIntoView({

                    behavior:
                        'smooth',

                    block:
                        'start'

                });

            }

        }
    )

    .catch(
        function (error) {

            console.error(
                '请求失败：',
                error
            );

            alert(
                '请求服务器失败，请检查 Apache 和 PHP'
            );

        }
    )

    .finally(
        function () {

            calculatePriceBtn.disabled =
                false;


            calculatePriceBtn.textContent =
                '看看它真正的价格';

        }
    );

}


});
