// 从自拍视频创建数字人功能
document.addEventListener('DOMContentLoaded', () => {
    // DOM元素
    const createFromVideoBtn = document.getElementById('createFromVideoBtn');
    const videoToDigitalModal = document.getElementById('videoToDigitalModal');
    const closeVideoToDigitalModal = document.getElementById('closeVideoToDigitalModal');
    const videoDropArea = document.getElementById('videoDropArea');
    const videoInput = document.getElementById('videoInput');
    const uploadVideoBtn = document.getElementById('uploadVideoBtn');
    const recordVideoBtn = document.getElementById('recordVideoBtn');
    const videoNextStepBtn = document.getElementById('videoNextStepBtn');
    const videoPrevStepBtn = document.getElementById('videoPrevStepBtn');
    const videoFinishBtn = document.getElementById('videoFinishFinishBtn');
    const videoStepIndicators = document.querySelectorAll('.video-step-indicator');
    const videoStepPanels = document.querySelectorAll('.video-step-panel');
    const videoProgressBar = document.getElementById('videoProgressBar');
    const recordVideoModal = document.getElementById('recordVideoModal');
    const closeRecordVideoModal = document.getElementById('closeRecordVideoModal');
    const videoPreviewElement = document.getElementById('videoPreviewElement');
    const startRecordBtn = document.getElementById('startRecordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const retakeRecordBtn = document.getElementById('retakeRecordBtn');
    const confirmRecordBtn = document.getElementById('confirmRecordBtn');
    const recordTimer = document.getElementById('recordTimer');
    const modelTrainingCenterModal = document.getElementById('modelTrainingCenterModal');
    const closeModelTrainingCenterModal = document.getElementById('closeModelTrainingCenterModal');
    const startTrainingBtn = document.getElementById('startTrainingBtn');
    const videoDigitalStyleOptions = document.querySelectorAll('.video-digital-style-option');

    // 变量
    let currentVideoStep = 1;
    let uploadedVideo = null;
    let mediaRecorder = null;
    let recordedChunks = [];
    let recordTimerInterval = null;
    let recordSeconds = 0;
    let similarityChart = null;

    // 初始化
    initEventListeners();

    // 初始化事件监听器
    function initEventListeners() {
        // 打开从自拍视频创建数字人弹窗
        createFromVideoBtn.addEventListener('click', () => {
            videoToDigitalModal.classList.remove('hidden');
            resetVideoToDigitalModal();
        });

        // 关闭从自拍视频创建数字人弹窗
        closeVideoToDigitalModal.addEventListener('click', () => {
            videoToDigitalModal.classList.add('hidden');
        });

        // 点击弹窗外部关闭弹窗
        window.addEventListener('click', (e) => {
            if (e.target === videoToDigitalModal) {
                videoToDigitalModal.classList.add('hidden');
            }
        });

        // 视频上传区域点击事件
        videoDropArea.addEventListener('click', () => {
            videoInput.click();
        });

        // 视频拖放功能
        videoDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoDropArea.classList.add('border-primary');
        });

        videoDropArea.addEventListener('dragleave', () => {
            videoDropArea.classList.remove('border-primary');
        });

        videoDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            videoDropArea.classList.remove('border-primary');

            if (e.dataTransfer.files.length) {
                handleVideoUpload(e.dataTransfer.files[0]);
            }
        });

        // 视频文件选择事件
        videoInput.addEventListener('change', () => {
            if (videoInput.files.length) {
                handleVideoUpload(videoInput.files[0]);
            }
        });

        // 上传视频按钮
        uploadVideoBtn.addEventListener('click', () => {
            videoInput.click();
        });

        // 录制视频按钮
        recordVideoBtn.addEventListener('click', () => {
            openRecordVideoModal();
        });

        // 下一步按钮
        videoNextStepBtn.addEventListener('click', () => {
            if (currentVideoStep === 1 && !uploadedVideo) {
                alert('请先上传视频或录制视频');
                return;
            }

            currentVideoStep++;
            updateVideoStepUI();

            if (currentVideoStep === 2) {
                // 模拟视频分析
                simulateVideoAnalysis();
            } else if (currentVideoStep === 3) {
                // 模拟特征提取
                simulateFeatureExtraction();
            } else if (currentVideoStep === 4) {
                // 模拟模型训练
                simulateModelTraining();
            } else if (currentVideoStep === 5) {
                // 显示完成按钮
                videoNextStepBtn.classList.add('hidden');
                videoFinishBtn.classList.remove('hidden');

                // 初始化相似度图表
                initSimilarityChart();
            }
        });

        // 上一步按钮
        videoPrevStepBtn.addEventListener('click', () => {
            currentVideoStep--;
            updateVideoStepUI();

            if (currentVideoStep === 5) {
                // 显示下一步按钮，隐藏完成按钮
                videoNextStepBtn.classList.remove('hidden');
                videoFinishFinishBtn.classList.add('hidden');
            }
        });

        // 完成按钮
        videoFinishBtn.addEventListener('click', () => {
            // 获取数字人名称
            const nameInput = document.getElementById('videoDigitalHumanName');
            const name = nameInput.value.trim() || '我的数字人';

            // 更新主界面的数字人形象
            const previewImg = document.getElementById('videoDigitalHumanPreview').querySelector('img').src;
            document.getElementById('digitalHuman').querySelector('img').src = previewImg;

            // 关闭弹窗
            videoToDigitalModal.classList.add('hidden');

            // 显示成功提示
            alert('${name}已成功创建并添加到编辑区！');
        });

        // 关闭录制视频弹窗
        closeRecordVideoModal.addEventListener('click', () => {
            closeRecordVideoModalHandler();
        });

        // 开始录制按钮
        startRecordBtn.addEventListener('click', () => {
            startRecording();
        });

        // 停止录制按钮
        stopRecordBtn.addEventListener('click', () => {
            stopRecording();
        });

        // 重新录制按钮
        retakeRecordBtn.addEventListener('click', () => {
            retakeRecording();
        });

        // 确认使用按钮
        confirmRecordBtn.addEventListener('click', () => {
            confirmRecording();
        });

        // 数字人风格选择
        videoDigitalStyleOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 移除其他选项的选中状态
                videoDigitalStyleOptions.forEach(opt => opt.classList.remove('selected', 'border-primary'));
                // 添加当前选项的选中状态
                option.classList.add('selected', 'border-primary');

                // 更新数字人预览
                updateDigitalHumanPreview(option);
            });
        });

        // 大模型训练中心相关
        startTrainingBtn.addEventListener('click', () => {
            startModelTraining();
        });
    }

    // 处理视频上传
    function handleVideoUpload(file) {
        // 检查文件类型
        if (!file.type.match('video.*')) {
            alert('请上传视频文件');
            return;
        }

        // 检查文件大小
        if (file.size > 50 * 1024 * 1024) {
            alert('视频大小不能超过50MB');
            return;
        }

        // 读取视频
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadedVideo = e.target.result;

            // 更新上传区域显示
            videoDropArea.innerHTML = `
                <video src="${uploadedVideo}" class="w-full h-full object-contain" controls></video>
            `;

            // 显示下一步按钮
            videoNextStepBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }

    // 更新步骤UI
    function updateVideoStepUI() {
        // 更新步骤指示器
        videoStepIndicators.forEach((indicator, index) => {
            const step = index + 1;

            if (step < currentVideoStep) {
                // 已完成的步骤
                indicator.classList.add('active');
                indicator.querySelector('div').classList.remove('bg-gray-200', 'text-neutral');
                indicator.querySelector('div').classList.add('bg-green-500', 'text-white');
            } else if (step === currentVideoStep) {
                // 当前步骤
                indicator.classList.add('active');
                indicator.querySelector('div').classList.remove('bg-gray-200', 'text-neutral', 'bg-green-500');
                indicator.querySelector('div').classList.add('bg-primary', 'text-white');
            } else {
                // 未完成的步骤
                indicator.classList.remove('active');
                indicator.querySelector('div').classList.remove('bg-primary', 'text-white', 'bg-green-500');
                indicator.querySelector('div').classList.add('bg-gray-200', 'text-neutral');
            }
        });

        // 更新进度条
        videoProgressBar.style.width = `${(currentVideoStep - 1) * 25}%`;

        // 更新步骤面板
        videoStepPanels.forEach((panel, index) => {
            if (index + 1 === currentVideoStep) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        });

        // 更新按钮显示
        if (currentVideoStep === 1) {
            videoPrevStepBtn.classList.add('hidden');
            videoNextStepBtn.classList.remove('hidden');
            videoFinishBtn.classList.add('hidden');
        } else if (currentVideoStep === 5) {
            videoPrevStepBtn.classList.remove('hidden');
            videoNextStepBtn.classList.add('hidden');
            videoFinishBtn.classList.remove('hidden');
        } else {
            videoPrevStepBtn.classList.remove('hidden');
            videoNextStepBtn.classList.remove('hidden');
            videoFinishBtn.classList.add('hidden');
        }
    }

    // 重置视频创建弹窗
    function resetVideoToDigitalModal() {
        currentVideoStep = 1;
        uploadedVideo = null;

        // 重置上传区域
        videoDropArea.innerHTML = `
            <img src="https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/4913091123724664aab0b0da5ce479dd~tplv-a9rns2rl98-image.image?rcl=2025102305205319E2ADB7C26D9C738041&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1763760069&x-signature=1Bgsmmq6cBkJYa38rP1lcwqUvCQ%3D" 
                 alt="上传图标" 
                 class="w-16 h-16 mb-3 opacity-50">
            <p class="text-center text-neutral mb-2">点击或拖拽视频到此处</p>
            <p class="text-xs text-center">支持MP4、WebM格式，大小不超过50MB</p>
        `;

        // 重置步骤UI
        updateVideoStepUI();

        // 隐藏按钮
        videoNextStepBtn.classList.add('hidden');
        videoPrevStepBtn.classList.add('hidden');
        videoFinishBtn.classList.add('hidden');
    }

    // 打开录制视频弹窗
    function openRecordVideoModal() {
        recordVideoModal.classList.remove('hidden');

        // 访问摄像头
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                videoPreviewElement.srcObject = stream;
            })
            .catch(err => {
                console.error('无法访问摄像头或麦克风:', err);
                alert('无法访问摄像头或麦克风，请确保您已授权。');
                closeRecordVideoModal.click();
            });
    }

    // 关闭录制视频弹窗处理
    function closeRecordVideoModalHandler() {
        recordVideoModal.classList.add('hidden');

        // 停止摄像头和麦克风
        if (videoPreviewElement.srcObject) {
            videoPreviewElement.srcObject.getTracks().forEach(track => track.stop());
            videoPreviewElement.srcObject = null;
        }

        // 停止录制
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        // 停止计时器
        if (recordTimerInterval) {
            clearInterval(recordTimerInterval);
            recordTimerInterval = null;
        }

        // 重置状态
        recordSeconds = 0;
        recordTimer.textContent = '00:00';

        // 重置按钮
        startRecordBtn.classList.remove('hidden');
        stopRecordBtn.classList.add('hidden');
        retakeRecordBtn.classList.add('hidden');
        confirmRecordBtn.classList.add('hidden');
    }

    // 开始录制
    function startRecording() {
        // 开始录制
        if (videoPreviewElement.srcObject) {
            mediaRecorder = new MediaRecorder(videoPreviewElement.srcObject);

            recordedChunks = [];
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoURL = URL.createObjectURL(blob);

                // 更新上传区域显示
                videoDropArea.innerHTML = `
                    <video src="${videoURL}" class="w-full h-full object-contain" controls></video>
                `;

                // 保存视频
                uploadedVideo = videoURL;
            };

            mediaRecorder.start();

            // 开始计时
            recordSeconds = 0;
            recordTimer.textContent = '00:00';
            recordTimerInterval = setInterval(() => {
                recordSeconds++;
                const minutes = Math.floor(recordSeconds / 60);
                const seconds = recordSeconds % 60;
                recordTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                // 限制最长录制时间为10秒
                if (recordSeconds >= 10) {
                    stopRecordBtn.click();
                }
            }, 1000);

            // 更新按钮
            startRecordBtn.classList.add('hidden');
            stopRecordBtn.classList.remove('hidden');
        }
    }

    // 停止录制
    function stopRecording() {
        // 停止录制
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        // 停止计时器
        if (recordTimerInterval) {
            clearInterval(recordTimerInterval);
            recordTimerInterval = null;
        }

        // 检查录制时长
        if (recordSeconds < 3) {
            alert('视频时长太短，请录制至少3秒的视频。');

            // 重置按钮
            startRecordBtn.classList.remove('hidden');
            stopRecordBtn.classList.add('hidden');
            retakeRecordBtn.classList.add('hidden');
            confirmRecordBtn.classList.add('hidden');

            return;
        }

        // 更新按钮
        stopRecordBtn.classList.add('hidden');
        retakeRecordBtn.classList.remove('hidden');
        confirmRecordBtn.classList.remove('hidden');
    }

    // 重新录制
    function retakeRecording() {
        // 重置按钮
        startRecordBtn.classList.remove('hidden');
        retakeRecordBtn.classList.add('hidden');
        confirmRecordBtn.classList.add('hidden');

        // 重置计时器
        recordSeconds = 0;
        recordTimer.textContent = '00:00';
    }

    // 确认使用录制的视频
    function confirmRecording() {
        // 关闭弹窗
        closeRecordVideoModal.click();

        // 显示下一步按钮
        videoNextStepBtn.classList.remove('hidden');

        // 确保视频创建弹窗是打开的
        videoToDigitalModal.classList.remove('hidden');
    }

    // 模拟视频分析
    function simulateVideoAnalysis() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            // 更新总进度
            document.getElementById('videoAnalysisPercentage').textContent = `${progress}%`;
            document.getElementById('videoAnalysisProgressBar').style.width = `${progress}%`;

            // 更新子进度
            document.getElementById('faceDetectionProgress').style.width = `${Math.min(progress + 10, 100)}%`;
            document.getElementById('voiceAnalysisProgress').style.width = `${Math.min(progress - 10, 100)}%`;

            if (progress >= 100) {
                clearInterval(interval);

                // 延迟一下，显示完成状态
                setTimeout(() => {
                    // 自动进入下一步
                    videoNextStepBtn.click();
                }, 500);
            }
        }, 100);
    }

    // 模拟特征提取
    function simulateFeatureExtraction() {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            // 更新总进度
            document.getElementById('featureExtractionPercentage').textContent = `${progress}%`;
            document.getElementById('featureExtractionProgressBar').style.width = `${progress}%`;

            // 更新子进度
            document.getElementById('expressionFeatureProgress').style.width = `${Math.min(progress, 100)}%`;
            document.getElementById('voiceFeatureProgress').style.width = `${Math.min(progress - 5, 100)}%`;
            document.getElementById('lipFeatureProgress').style.width = `${Math.min(progress + 5, 100)}%`;
            document.getElementById('accentFeatureProgress').style.width = `${Math.min(progress - 10, 100)}%`;

            if (progress >= 100) {
                clearInterval(interval);

                // 延迟一下，显示完成状态
                setTimeout(() => {
                    // 自动进入下一步
                    videoNextStepBtn.click();
                }, 500);
            }
        }, 100);
    }

    // 模拟模型训练
    function simulateModelTraining() {
        let progress = 0;
        let lossValue = 1.0;
        const trainingStatus = document.getElementById('trainingStatus');
        const statusMessages = [
            '初始化模型...',
            '训练面部特征识别...',
            '训练语音特征识别...',
            '训练表情特征识别...',
            '训练嘴型特征识别...',
            '优化模型参数...',
            '验证模型性能...',
            '完成训练...'
        ];

        const interval = setInterval(() => {
            progress += 2;

            // 更新总进度
            document.getElementById('modelTrainingPercentage').textContent = `${progress}%`;
            document.getElementById('modelTrainingProgressBar').style.width = `${progress}%`;

            // 更新损失值
            lossValue = Math.max(0.01, lossValue - 0.01);
            document.getElementById('lossValue').textContent = lossValue.toFixed(4);
            document.getElementById('lossProgressBar').style.width = `${lossValue * 100}%`;

            // 更新训练状态
            const statusIndex = Math.min(Math.floor(progress / 12.5), statusMessages.length - 1);
            trainingStatus.innerHTML = `<p>${statusMessages[statusIndex]}</p>`;

            if (progress >= 100) {
                clearInterval(interval);

                // 延迟一下，显示完成状态
                setTimeout(() => {
                    // 自动进入下一步
                    videoNextStepBtn.click();
                }, 500);
            }
        }, 200);
    }

    // 初始化相似度图表
    function initSimilarityChart() {
        const ctx = document.getElementById('similarityChart').getContext('2d');

        similarityChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['初始', '1个视频', '2个视频', '3个视频', '4个视频', '5个视频'],
                datasets: [{
                    label: '相似度',
                    data: [40, 55, 65, 75, 82, 85],
                    borderColor: '#1E40AF',
                    backgroundColor: 'rgba(30, 64, 175, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // 更新数字人预览
    function updateDigitalHumanPreview(option) {
        const style = option.querySelector('p').textContent;
        let previewImg = document.getElementById('videoDigitalHumanPreview').querySelector('img');

        // 根据选择的风格更新预览图
        if (style === '写实风格') {
            previewImg.src = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/a5fc0b71e3c245829a3dbf27689d8435~tplv-a9rns2rl98-image.image?rcl=2025102305205319E2ADB7C26D9C738041&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1763760069&x-signature=RFGR0wB1CmD6ojsQUtbVKLhB%2Bss%3D';
        } else if (style === '卡通风格') {
            previewImg.src = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/a5fc0b71e3c245829a3dbf27689d8435~tplv-a9rns2rl98-image.image?rcl=2025102305205319E2ADB7C26D9C738041&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1763760069&x-signature=RFGR0wB1CmD6ojsQUtbVKLhB%2Bss%3D';
        } else if (style === '动漫风格') {
            previewImg.src = 'https://p3-flow-imagex-sign.byteimg.com/tos-cn-i-a9rns2rl98/rc/pc/super_tool/a5fc0b71e3c245829a3dbf27689d8435~tplv-a9rns2rl98-image.image?rcl=2025102305205319E2ADB7C26D9C738041&rk3s=8e244e95&rrcfp=f06b921b&x-expires=1763760069&x-signature=RFGR0wB1CmD6ojsQUtbVKLhB%2Bss%3D';
        }
    }

    // 开始模型训练
    function startModelTraining() {
        alert('开始训练模型，这可能需要几分钟时间...');

        // 模拟训练进度
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            if (progress >= 100) {
                clearInterval(interval);
                alert('模型训练完成！相似度提升至90%');

                // 更新相似度图表
                if (similarityChart) {
                    similarityChart.data.labels.push('6个视频');
                    similarityChart.data.datasets[0].data.push(90);
                    similarityChart.update();
                }
            }
        }, 200);
    }
});
