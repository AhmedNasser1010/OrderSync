import { useDispatch, useSelector } from 'react-redux'
import { Formik, Form, Field } from 'formik';
import { object, string } from 'yup';
import styled from 'styled-components'
import DB_ADD_DOC from '../../utils/DB_ADD_DOC'
import { initUser } from '../../rtk/slices/userSlice'
import { toggleLoginSidebar } from '../../rtk/slices/toggleSlice'
import { useTranslation } from 'react-i18next'

const Container = styled.div``
const FormContainer = styled(Form)`
	& label {
		margin-bottom: 20px;
    display: block;
	}
`

const phoneNumberRegex = /01\w{8}/

function UserInfoForm({ setExpandUserInfo }) {
	const { t } = useTranslation()
	const dispatch = useDispatch()
	const user = useSelector(state => state.user)

	const initialValues = {
		name: user?.userInfo?.name || '',
		phone: user?.userInfo?.phone?.slice(2) || '',
		secondPhone: user?.userInfo?.secondPhone?.slice(2) || '',
	}

	const validationSchema = object({
		name: string().min(3).max(25),
		phone: string().matches(phoneNumberRegex),
		secondPhone: string().matches(phoneNumberRegex),
	})

	const InputWrapperProps = (name, placeholder, errors, touched) => {
		return {
			name: name,
			placeholder: placeholder,
			error: errors && touched && errors[name] && touched[name] && true
		}
	}

	return (

		<Container>
			<Formik
				enableReinitialize
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={values => {
					const finalUserData = {
						...user,
						userInfo: {
							...user.userInfo,
							name: values.name,
							phone: values.phone ? '+2' + values.phone : '',
							secondPhone: values.secondPhone ? '+2' + values.secondPhone : ''
						}
					}

					const notSameName = finalUserData?.userInfo?.name !== user?.userInfo?.name
					const notPrimaryNum = finalUserData?.userInfo?.phone !== user?.userInfo?.phone
					const notSecondNum = finalUserData?.userInfo?.secondPhone !== user?.userInfo?.secondPhone

					setExpandUserInfo(false)
					dispatch(toggleLoginSidebar())
					document.body.classList.remove("overflow-hidden")

					if (notSameName || notPrimaryNum || notSecondNum) {
						DB_ADD_DOC('customers', user?.userInfo?.uid, finalUserData).then(res => {
							dispatch(initUser(finalUserData))
						})
					}
				}}
			>
				{({ errors, touched }) => (
					<FormContainer>
						<Field className={`w-full p-5 border border-gray-300 ${errors.name && 'text-red-500'}`} {...InputWrapperProps('name', t('Name'), errors, touched)} />
						<Field className={`w-full p-5 border border-gray-300 border-t-0 ${errors.phone && 'text-red-500'}`} {...InputWrapperProps('phone', t('Primary Phone Number'), errors, touched)} />
					</FormContainer>
				)}
			</Formik>
		</Container>

	)
}

export default UserInfoForm