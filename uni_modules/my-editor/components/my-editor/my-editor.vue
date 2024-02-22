<template>
	<view>
		<RichTextEditor
			v-model="WatchValue"
			api-key="aftntq63bw223hr6734y7dbk7xm3kraxx6r10a86lgbh3ipm"
			:init="{
				height: 500,
				width: 800,
				selector: '#tinymce',
				plugins: [
					'image wordcount paste'
				//'advlist autolink lists link image charmap print preview anchor',
				//'searchreplace visualblocks code fullscreen',
				//'insertdatetime media table paste code wordcount',
				//'autosave bbcode codesample directionality emoticons fullpage hr nonbreaking pagebreak save tabfocus template toc visualchars'
				],
				toolbar: ['undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image'],
				language: 'zh_CN',
				paste_data_images: true, // 允许粘贴图像
				// menubar: false, // 隐藏最上方menu
				/**
				 * 下面方法是为tinymce添加自定义插入图片按钮
				 * 借助iview的Upload组件,将图片先上传到存储云上，再将图片的存储地址放入编辑器内容
				 */
				// 图片上传三个参数，图片数据，成功时的回调函数，失败时的回调函数
				images_upload_handler: (blobInfo, success, failure) => {
					images_upload_handler(blobInfo, success, failure)
				},
				file_picker_callback: function(callback, value, meta) {},
				branding: false,
				draggable_modal: true
			}"
		/>
	</view>
</template>

<script>
	import Editor from '../tinymce-vue'
	console.log('Editor', Editor)
	
	export default {
		data() {
			return {
				isShowEdit: true,
				files: [],
				// WatchValue: JSON.parse(JSON.stringify(this.value))
				WatchValue: ''
			};
		},
		props:{
			value:String,
			default: ''
		},
		components: {
		  'RichTextEditor': Editor
		},
		beforeUpdate() {
			console.log('beforeUpdate', this.value)
			this.WatchValue = this.value
		},
		watch:{
			// value(val) {
			// 	console.log('value', val)
			// },
			WatchValue(value){
				console.log('WatchValue', value)
				this.$emit('input',value)
			}
		},
		methods: {
			// 图片上传三个参数，图片数据，成功时的回调函数，失败时的回调函数
			images_upload_handler(blobInfo, success, failure) {
				let blob = blobInfo.blob()
				console.log('blobInfo.blob()', blobInfo.blob())
				console.log('uniCloud', uniCloud)
				let objectURL = URL.createObjectURL(blob);
				console.log('objectURL', objectURL)
				uniCloud.uploadFile({
					filePath: objectURL,
					cloudPath: Date.now() + '.jpg',
					onUploadProgress: function(progressEvent) {
						console.log(progressEvent);
						var percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
					},
					success(res) {
						console.log('success', res)
						success(res.fileID)
					},
					fail() {},
					complete() {}
				});
			},
			
			/**
			 * 选择文件并上传
			 */
			chooseFiles() {
				const _extname = get_extname(this.fileExtname)
				// 获取后缀
				chooseAndUploadFile({
						type: 'image',
						compressed: false,
						sizeType: ['original', 'compressed'],
						// TODO 如果为空，video 有问题
						extension: _extname.length > 0 ? _extname : undefined,
						// count: this.limitLength - this.files.length, //默认9
						count: 9, //默认9
						onChooseFile: this.chooseFileCallback
					})
					.then(result => {
						this.setSuccessAndError(result.tempFiles)
					})
					.catch(err => {
						console.log('选择失败', err)
					})
			},
			
			/**
			 * 选择文件回调
			 * @param {Object} res
			 */
			async chooseFileCallback(res) {
				const _extname = get_extname(this.fileExtname)
				const is_one = (Number(this.limitLength) === 1 &&
						this.disablePreview &&
						!this.disabled) ||
					this.returnType === 'object'
				// 如果这有一个文件 ，需要清空本地缓存数据
				if (is_one) {
					this.files = []
				}
			
				let {
					filePaths,
					files
				} = get_files_and_is_max(res, _extname)
				if (!(_extname && _extname.length > 0)) {
					filePaths = res.tempFilePaths
					files = res.tempFiles
				}
			
				let currentData = []
				for (let i = 0; i < files.length; i++) {
					if (this.limitLength - this.files.length <= 0) break
					files[i].uuid = Date.now()
					let filedata = await get_file_data(files[i], this.fileMediatype)
					filedata.progress = 0
					filedata.status = 'ready'
					this.files.push(filedata)
					currentData.push({
						...filedata,
						file: files[i]
					})
				}
				this.$emit('select', {
					tempFiles: currentData,
					tempFilePaths: filePaths
				})
				res.tempFiles = files
				// 停止自动上传
				if (!this.autoUpload || this.noSpace) {
					res.tempFiles = []
				}
			},
			
			/**
			 * 成功或失败
			 */
			async setSuccessAndError(res, fn) {
				let successData = []
				let errorData = []
				let tempFilePath = []
				let errorTempFilePath = []
				for (let i = 0; i < res.length; i++) {
					const item = res[i]
					const index = item.uuid ? this.files.findIndex(p => p.uuid === item.uuid) : item.index
			
					if (index === -1 || !this.files) break
					if (item.errMsg === 'request:fail') {
						this.files[index].url = item.path
						this.files[index].status = 'error'
						this.files[index].errMsg = item.errMsg
						// this.files[index].progress = -1
						errorData.push(this.files[index])
						errorTempFilePath.push(this.files[index].url)
					} else {
						this.files[index].errMsg = ''
						this.files[index].fileID = item.url
						const reg = /cloud:\/\/([\w.]+\/?)\S*/
						if (reg.test(item.url)) {
							this.files[index].url = await this.getTempFileURL(item.url)
						}else{
							this.files[index].url = item.url
						}
			
						this.files[index].status = 'success'
						this.files[index].progress += 1
						successData.push(this.files[index])
						tempFilePath.push(this.files[index].fileID)
					}
				}
			
				if (successData.length > 0) {
					this.setEmit()
					// 状态改变返回
					this.$emit('success', {
						tempFiles: this.backObject(successData),
						tempFilePaths: tempFilePath
					})
				}
			
				if (errorData.length > 0) {
					this.$emit('fail', {
						tempFiles: this.backObject(errorData),
						tempFilePaths: errorTempFilePath
					})
				}
			},
			
		}
	}
</script>

<style>

</style>
